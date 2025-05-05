<script setup>
const { $directus, $readItem, $createItem, $updateItem, $uploadFiles } = useNuxtApp();
const route = useRoute();

const { data: form } = await useAsyncData('form', () => {
    return $directus.request($readItem('forms', route.params.form, {
        fields: ['id', 'title', 'description', {
            fields: ['id', 'type', 'label', 'placeholder', 'required', 'options'],
        }],
    }));
});

const fieldsMap = {
    input: resolveComponent('UInput'),
    tel: resolveComponent('UInput'),
    email: resolveComponent('UInput'),
    textarea: resolveComponent('UTextarea'),
    toggle: resolveComponent('UCheckbox'),
    checkbox: resolveComponent('UCheckboxGroup'),
    radio: resolveComponent('URadioGroup'),
    select: resolveComponent('USelect'),
    signature: resolveComponent('FormSignaturePad'),
};

const formData = reactive({
    date_started: new Date().toISOString(),
    answers: {}
});

const currentStep = ref(0);
const start = ref(false)
const evidenceID = ref(null)
const submitting = ref(false)

const onSubmit = async () => {
    submitting.value = true;

    const data = {
        date_started: unref(formData).date_started,
        form: route.params.form,
        answers: [],
    };

    Object.keys(unref(formData).answers).forEach((key) => {
        data.answers.push({
            field: key,
            value: unref(formData).answers[key],
        });
    });

    try {
        const response = await $directus.request($createItem('form_submissions', data));
        console.log('Form submitted successfully:', response);
        if (response) {
            const pdfResponse = await generateEvidence(response?.id);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};

const generateEvidence = async (submissionID) => {

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/pdf");

    const response = await fetch(`/api/pdf`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
            id: submissionID
        }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.message || `HTTP error! Status: ${response.status}`
        );
    }

    const result = await response.json();

    console.log("result:", result)

    await uploadEvidence(result)
}

const uploadEvidence = async (data) => {
    try {
        const formData = new FormData();

        const blob = await (await fetch(`data:application/pdf;base64,${data.pdf}`)).blob();
        const file = new File([blob], data.filename, { type: "application/pdf" });

        formData.append("folder", "1b22fd7c-d86f-4ab8-be78-482df5693f4a");
        formData.append("file", file);

        const response = await $directus.request($uploadFiles(formData, {
            fields: ['id']
        }));

        console.log("uploadEvidence response", response)
        evidenceID.value = response?.id;
    } catch (error) {
        console.error('Error generation pdf:', error);
    }
}

const disabled = computed(() => {
    const currentField = form.value?.fields?.[currentStep.value];

    if (currentField?.required && !formData.answers[currentField?.id]) {
        return true;
    }
    return false;
});
</script>

<template>
    <div class="relative h-screen flex items-center justify-center px-4">
        <img src="/bg.webp" class="absolute inset-0 h-full w-full object-center object-cover z-0" alt="">

        <div class="absolute flex items-center justify-center top-8 inset-x-0">
            <Logo class="h-16 w-auto mx-auto" />
        </div>

        <div class="relative w-full">
            <div class="max-w-3xl mt-32 w-full mx-auto grid gap-8 py-8 bg-white z-10 relative px-5 rounded-3xl">
                <UForm v-auto-animate :state="formData.answers" @submit="onSubmit">

                    <template v-if="!start">
                        <div class="flex justify-center flex-col items-center">
                            <h4 class="text-2xl md:text-3xl font-bold text-center text-secondary mb-8">Permission to
                                Contact</h4>

                            <p class="text-center max-w-xl mx-auto mb-8">We can help you find a policy that’s right for you. Fill out this short form so a
                                licensed agent from HealthyStart Group can contact you.</p>

                            <UButton size="xl" target="_blank" @click.prevent="start = !start">Start now</UButton>
                        </div>
                    </template>

                    <template v-if="!evidenceID && start">
                        <template v-for="(field, fieldInx) in form?.fields" :key="field?.id">
                            <template v-if="currentStep === fieldInx">
                                <template v-if="['input', 'tel', 'email', 'textarea'].includes(field?.type)">
                                    <UFormField :label="field?.label" :name="field?.id" :required="field?.required">
                                        <component class="w-full" size="xl" :is="fieldsMap[field?.type]"
                                            :type="field?.type" :placeholder="field?.placeholder"
                                            v-model="formData.answers[field.id]" />
                                    </UFormField>
                                </template>

                                <template v-if="['checkbox', 'radio'].includes(field?.type)">
                                    <UFormField :label="field?.label" :name="field?.id" :required="field?.required">
                                        <component class="w-full" size="xl" :is="fieldsMap[field?.type]"
                                            v-model="formData.answers[field.id]" :items="field?.options"
                                            :placeholder="field?.placeholder" :label="field?.label"
                                            orientation="horizontal" indicator="end" variant="card" />
                                    </UFormField>
                                </template>

                                <template v-if="['select'].includes(field?.type)">
                                    <UFormField :label="field?.label" :name="field?.id" :required="field?.required">
                                        <component class="w-full" size="xl" :is="fieldsMap[field?.type]"
                                            v-model="formData.answers[field.id]" :items="field?.options"
                                            :placeholder="field?.placeholder" :label="field?.label" />
                                    </UFormField>
                                </template>

                                <template v-if="['toggle'].includes(field?.type)">
                                    <UFormField :name="field?.id" :required="field?.required">
                                        <component class="w-full" size="xl" :is="fieldsMap[field?.type]"
                                            v-model="formData.answers[field.id]" :items="field?.options"
                                            :label="field?.label" />
                                    </UFormField>
                                </template>

                                <template v-if="['signature'].includes(field?.type)">
                                    <UFormField :name="field?.id" :required="field?.required">
                                        <component :is="fieldsMap[field?.type]"
                                            @set-value="(n) => formData.answers[field.id] = n" />
                                    </UFormField>
                                </template>
                            </template>
                        </template>
                    </template>

                    <template v-if="evidenceID && start">
                        <div class="flex justify-center flex-col items-center">
                            <h4 class="text-2xl md:text-3xl font-bold text-center text-secondary mb-8">Thank you for
                                successfully <br class="hidden md:block"> submitting the form</h4>

                            <UButton size="xl" target="_blank"
                                :href="`https://admin.healthystartgroup.com/assets/${evidenceID}`" download>Download
                                your
                                evidence</UButton>
                        </div>
                    </template>

                    <div v-if="!evidenceID && start" class="flex justify-between gap-8 mt-8">
                        <UButton v-if="currentStep > 0" @click="currentStep--" color="secondary" :disabled="submitting"
                            size="xl">
                            Back
                        </UButton>

                        <div v-if="currentStep <= 0"></div>

                        <UButton v-if="currentStep < (form?.fields.length - 1)" @click="currentStep++" size="xl"
                            color="primary" :disabled="disabled" class="disabled:opacity-10">
                            Next
                        </UButton>

                        <UButton v-if="currentStep === (form?.fields.length - 1)" @click="onSubmit()" color="primary"
                            :disabled="disabled" :loading="submitting" trailing-icon="i-lucide-arrow-right" size="xl"
                            class="disabled:opacity-10">
                            {{ submitting ? 'Sending' : 'Submit' }}
                        </UButton>
                    </div>
                </UForm>
            </div>
        </div>

        <p class="text-white text-sm absolute bottom-8 inset-x-0 text-center">Powered by <a
                href="https://zunamicorp.com" target="_blank" rel="noopener noreferrer"
                class="hover:text-primary hover:underline">ZunamiCorp</a></p>
    </div>
</template>

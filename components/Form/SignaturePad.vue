<script setup>
const { $directus, $uploadFiles } = useNuxtApp();
const route = useRoute();
const emit = defineEmits(['setValue']);

const options = ref({
    penColor: 'rgb(0,0,0)',
    backgroundColor: 'rgb(255, 255, 255)',
    maxWidth: 2,
    minWidth: 2,
});
const signature = ref();
const saving = ref(false)

const handleSave = async function () {
    saving.value = true;
    const dataUrl = signature.value.saveSignature("image/svg+xml");
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `signature-${route.params.form}.svg`, { type: 'image/svg+xml' });

    try {
        const formData = new FormData();

        formData.append("folder", "1b22fd7c-d86f-4ab8-be78-482df5693f4a");
        formData.append("file", file);

        const response = await $directus.request($uploadFiles(formData, {
            fields: ['id']
        }));

        emit("setValue", response?.id);
        saving.value = false;

        // console.log('Signature submitted successfully:', response);
    } catch (error) {
        console.error('Error submitting signature:', error);

    }
};

const handleClean = function () {
    signature.value.clearCanvas();
    emit("setValue", null)
};

</script>

<template>
    <div>
        <div
            class="w-full rounded-md border-0 placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 transition-colors px-2.5 py-1.5 text-sm gap-1.5 text-highlighted bg-default ring ring-inset ring-accented focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
            <NuxtSignaturePad ref="signature" height="250px" width="100%" :max-width="options.maxWidth"
                :min-width="options.minWidth" :options="{
                    penColor: options.penColor,
                    backgroundColor: options.backgroundColor,
                }" />
        </div>

        <div class="flex justify-center space-x-4 mt-4">
            <UButton @click.prevent="handleClean()" size="xs" color="secondary">Clear</UButton>
            <UButton @click.prevent="handleSave()" size="xs" :loading="saving" color="primary">Save</UButton>
        </div>
    </div>
</template>

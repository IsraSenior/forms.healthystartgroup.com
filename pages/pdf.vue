<script setup>
definePageMeta({
    layout: 'pdf'
});

const { $directus, $readItem } = useNuxtApp();
const route = useRoute();

const { data: submission } = await useAsyncData('submission', async () => {
    const response = await $directus.request($readItem('form_submissions', route.query.submission, {
        fields: ['id', 'form', {
            answers: ['value', {
                field: ['id', 'label', 'slug']
            }]
        }],
    }));

    return {
        id: response.id,
        form: response.form,
        answers: response.answers.reduce((acc, answer) => {
            acc[answer.field.slug] = answer.value;
            return acc;
        }, {})
    };
});
</script>

<template>
    <div v-if="submission" id="report-content">
        <PDFPage>
            <div class="flex items-center justify-center h-full">
                <div class="rounded-3xl overflow-hidden border border-secondary flex flex-col justify-between w-full">
                    <header class="bg-primary p-4">
                        <h2 class="uppercase text-center text-secondary font-bold text-3xl">Permition to contact</h2>
                    </header>

                    <section class="px-4 py-8">
                        <h3 class="text-primary font-semibold text-xl text-center">We can help you find a policy that’s
                            right for you.</h3>
                        <div class="grid grid-cols-4 gap-8 mt-8 max-w-4xl mx-auto">
                            <div class="flex items-center space-x-2 col-span-4">
                                <span
                                    class="size-5 border border-secondary rounded-sm relative flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1" stroke="currentColor" class="size-4">
                                        <path v-if="submission?.answers?.approve == 'true'" stroke-linecap="round"
                                            stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        <path v-else stroke-linecap="round" stroke-linejoin="round"
                                            d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </span>
                                <p class="text-secondary font-normal text-base">Yes, please contact me with more
                                    information
                                    about HealthyStart Group Plans.</p>
                            </div>

                            <div class="flex items-center relative col-span-4">
                                <p class="text-secondary font-normal text-base bg-white relative z-10 pr-4">Do you have
                                    Medicare Part A and Part B?:</p>
                                <span class="text-secondary">{{ JSON.parse(submission?.answers?.medicare).join(", ")
                                    }}</span>
                                <span
                                    class="w-full border-b border-dotted border-secondary absolute bottom-0 left-0"></span>
                            </div>

                            <div class="flex items-center relative col-span-4">
                                <p class="text-secondary font-normal text-base bg-white relative z-10 pr-4">Do you have
                                    Medicaid?:</p>
                                <span class="text-secondary">{{ submission?.answers?.medicaid }}</span>
                                <span
                                    class="w-full border-b border-dotted border-secondary absolute bottom-0 left-0"></span>
                            </div>

                            <div class="flex items-center relative col-span-2">
                                <p class="text-secondary font-normal text-base bg-white relative z-10 pr-4">First name:
                                </p>
                                <span class="text-secondary">{{ submission?.answers?.firstname }}</span>
                                <span
                                    class="w-full border-b border-dotted border-secondary absolute bottom-0 left-0"></span>
                            </div>

                            <div class="flex items-center relative col-span-2">
                                <p class="text-secondary font-normal text-base bg-white relative z-10 pr-4">Last name:
                                </p>
                                <span class="text-secondary">{{ submission?.answers?.lastname }}</span>
                                <span
                                    class="w-full border-b border-dotted border-secondary absolute bottom-0 left-0"></span>
                            </div>

                            <div class="flex items-center relative col-span-3">
                                <p class="text-secondary font-normal text-base bg-white relative z-10 pr-4">Addres:</p>
                                <span class="text-secondary">{{ submission?.answers?.address }}</span>
                                <span
                                    class="w-full border-b border-dotted border-secondary absolute bottom-0 left-0"></span>
                            </div>

                            <div class="flex items-center relative col-span-1">
                                <p class="text-secondary font-normal text-base bg-white relative z-10 pr-4">Zip Code:
                                </p>
                                <span class="text-secondary">{{ submission?.answers?.zip }}</span>
                                <span
                                    class="w-full border-b border-dotted border-secondary absolute bottom-0 left-0"></span>
                            </div>

                            <div class="flex items-center relative col-span-2">
                                <p class="text-secondary font-normal text-base bg-white relative z-10 pr-4">City:</p>
                                <span class="text-secondary">{{ submission?.answers?.city }}</span>
                                <span
                                    class="w-full border-b border-dotted border-secondary absolute bottom-0 left-0"></span>
                            </div>

                            <div class="flex items-center relative col-span-2">
                                <p class="text-secondary font-normal text-base bg-white relative z-10 pr-4">State:</p>
                                <span class="text-secondary">{{ submission?.answers?.state }}</span>
                                <span
                                    class="w-full border-b border-dotted border-secondary absolute bottom-0 left-0"></span>
                            </div>

                            <div class="flex items-center relative col-span-2">
                                <p class="text-secondary font-normal text-base bg-white relative z-10 pr-4">Phone
                                    number:</p>
                                <span class="text-secondary">{{ submission?.answers?.phone }}</span>
                                <span
                                    class="w-full border-b border-dotted border-secondary absolute bottom-0 left-0"></span>
                            </div>

                            <div class="flex items-center relative col-span-2">
                                <p class="text-secondary font-normal text-base bg-white relative z-10 pr-4">Email
                                    <small>(optional):</small>
                                </p>
                                <span class="text-secondary">{{ submission?.answers?.email }}</span>
                                <span
                                    class="w-full border-b border-dotted border-secondary absolute bottom-0 left-0"></span>
                            </div>

                            <div class="col-span-4">
                                <p
                                    class="text-secondary font-normal text-xs">
                                    By returning this card, you agree that a HealthyStart Group sales representative may
                                    contact
                                    you
                                    about Medicare Advantage or Part D plans.
                                    Plans are insured through HealthyStart Group insurance Agency or one of
                                    its affiliated companies, a Medicare Advantage organization with a Medicare contract
                                    and a
                                    contract with the State Medicaid Program. Enrollment
                                    in the plan depends on the plan’s contract renewal with Medicare. This
                                    plan is available to anyone who has both Medical Assistance form the
                                    State and Medicare
                                </p>
                            </div>

                        </div>
                    </section>

                    <footer class="bg-secondary grid grid-cols-2 gap-4 p-4">
                        <div class="flex flex-col justify-between items-start space-y-4">
                            <Logo class="h-14" />

                            <div>
                                <p class="text-white text-xs">Form ID: {{ submission?.form }}</p>
                                <p class="text-white text-xs">Submission ID: {{ submission?.id }}</p>
                            </div>
                        </div>
                        <div class="bg-white h-24 rounded-br-xl relative">
                            <span class="absolute top-4 left-4 text-secondary font-normal text-sm">Sign here</span>

                            <img :src="`https://admin.healthystartgroup.com/assets/${submission?.answers?.signature}`"
                                class="h-full w-full object-contain absolute inset-0" alt="">
                        </div>
                    </footer>
                </div>
            </div>
        </PDFPage>

        <!-- <PDFPage>
            <div class="flex items-center justify-center h-full py-12">
                <div class="border border-secondary rounded-3xl overflow-hidden flex flex-col justify-between h-full">
                    <div class="bg-secondary p-4 flex items-center justify-between w-full">
                        <Logo class="h-16" />

                        <div class="text-right">
                            <p class="text-white text-xs">Form ID: {{ submission?.form }}</p>
                            <p class="text-white text-xs">Submission ID: {{ submission?.id }}</p>
                        </div>
                    </div>

                    <div class="px-4 pb-8">
                        <p class="text-secondary font-normal text-base border-t border-dotted border-secondary pt-8">
                            By returning this card, you agree that a HealthyStart Group sales representative may contact
                            you
                            about Medicare Advantage or Part D plans.
                            Plans are insured through HealthyStart Group insurance Agency or one of
                            its affiliated companies, a Medicare Advantage organization with a Medicare contract and a
                            contract with the State Medicaid Program. Enrollment
                            in the plan depends on the plan’s contract renewal with Medicare. This
                            plan is available to anyone who has both Medical Assistance form the
                            State and Medicare
                        </p>
                    </div>
                </div>
            </div>
        </PDFPage> -->
    </div>
</template>
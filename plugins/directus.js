import { createDirectus, rest, readItem, readItems, createItem, updateItem, uploadFiles, authentication } from '@directus/sdk';

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	const directus = createDirectus(config.public.directusUrl)
		.with(rest())
		.with(authentication());

	return {
		provide: { directus, readItem, readItems, createItem, updateItem, uploadFiles },
	};
});

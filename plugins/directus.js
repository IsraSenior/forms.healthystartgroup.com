import { createDirectus, rest, readItem, readItems, createItem, updateItem, uploadFiles } from '@directus/sdk';

const directus = createDirectus('https://admin.healthystartgroup.com').with(rest());

export default defineNuxtPlugin(() => {
	return {
		provide: { directus, readItem, readItems, createItem, updateItem, uploadFiles },
	};
});
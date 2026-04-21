// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  modules: [
    "@pinia/nuxt",
    "@nuxt/ui",
    "@formkit/auto-animate",
    "nuxt-signature-pad",
  ],

  css: ["~/assets/css/main.css"],

  app: {
    head: {
      title: "HSG - Forms", // default fallback title
      htmlAttrs: {
        lang: "en",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  ui: {
    colorMode: false,
    theme: {
      colors: ["primary", "secondary"],
    },
  },

  runtimeConfig: {
    public: {
      directusUrl: process.env.DIRECTUS_URL || 'https://admin.healthystartgroup.com',
      baseUrl: process.env.BASE_URL || 'https://forms.healthystartgroup.com',
      uploadsFolderId: process.env.UPLOADS_FOLDER_ID || '1b22fd7c-d86f-4ab8-be78-482df5693f4a',
    }
  },

  nitro: {
    routeRules: {
      "/api/**": {
        cors: true,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    },
  },
});

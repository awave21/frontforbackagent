// @ts-ignore
export default defineNuxtConfig({
  devtools: { enabled: true },
  typescript: { strict: true },

  css: ["~/assets/css/main.css"],

  modules: [
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
    "@pinia/nuxt",
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api/v1",
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://front.agentsapp.integration-ai.ru",
      domain: process.env.NUXT_PUBLIC_DOMAIN || "front.agentsapp.integration-ai.ru",
    },
  },

  nitro: {
    preset: "node-server",
    devProxy: {
      "/api/v1": {
        target: "https://agentsapp.integration-ai.ru",
        changeOrigin: true,
        prependPath: true,
      },
    },
    routeRules: {
      // API routes proxy to backend in development
      "/api/v1/**": { proxy: "https://agentsapp.integration-ai.ru/api/v1/**" },
    },
  },

  ssr: false,

  app: {
    head: {
      htmlAttrs: {
        lang: "ru",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Agents App - AI Integration Platform",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      ],
    },
  },

  // Production optimizations
  vite: {
    // ...
  },
});

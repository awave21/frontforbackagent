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
      // Значения по умолчанию для development
      // В production переопределяются через NUXT_PUBLIC_* переменные окружения или .env
      apiBase: "/api/v1",
      siteUrl: "http://localhost:3000",
      domain: "localhost",
    },
  },

  nitro: {
    // В dev-режиме проксируем API на бэкенд
    devProxy: {
      "/api/v1": {
        target: "https://agentsapp.integration-ai.ru",
        changeOrigin: true,
        prependPath: true,
      },
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

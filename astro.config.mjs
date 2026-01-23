import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://hermit403.github.io",
  base: "/openahu-website",
  compressHTML: true,
  server: {
    host: true,
  },
  build: {
    format: "directory",
  },
});

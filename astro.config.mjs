// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://estoc-dev.github.io",
  base: "/blog-zh",
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
});

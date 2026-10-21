// @ts-check
import { defineConfig } from "astro/config";

/**
 * Posts show a type as one line, `Name  {…}`, in a fence without a language;
 * the name gets its own span so the page can set it apart from the shape.
 * @type {import("shiki").ShikiTransformer}
 */
const typeNames = {
  name: "type-names",
  line(line) {
    if (this.options.lang !== "plaintext") return;
    const token = line.children[0];
    const text = token?.type === "element" ? token.children[0] : undefined;
    const match = text?.type === "text" ? /^([A-Z]\w*)(\s+\{.*)$/.exec(text.value) : null;
    if (match === null || token?.type !== "element") return;
    token.children = [
      { type: "element", tagName: "span", properties: { class: "type-name" }, children: [{ type: "text", value: match[1] }] },
      { type: "text", value: match[2] },
    ];
  },
};

export default defineConfig({
  site: "https://blog.estoc.dev",
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      transformers: [typeNames],
    },
  },
});

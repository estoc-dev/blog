// @ts-check
import { defineConfig } from "astro/config";

/**
 * Posts show a type as one line, `Name  {…}`, and a folder entry as
 * `path  description`, in a fence without a language. Such a line wraps on a
 * narrow page, so it records where its second column starts, inside the brace
 * when there is one, for the page to hang the continuation there. A type name
 * gets its own span so the page can set it apart from the shape.
 * @type {import("shiki").ShikiTransformer}
 */
const plainColumns = {
  name: "plain-columns",
  line(line) {
    if (this.options.lang !== "plaintext") return;
    const token = line.children[0];
    const text = token?.type === "element" ? token.children[0] : undefined;
    if (token?.type !== "element" || text?.type !== "text") return;
    const hang = /^\S+\s{2,}[{[]?/.exec(text.value);
    if (hang !== null) line.properties.style = `--hang: ${hang[0].length}ch`;
    const type = /^([A-Z]\w*)(\s+\{.*)$/.exec(text.value);
    if (type === null) return;
    token.children = [
      { type: "element", tagName: "span", properties: { class: "type-name" }, children: [{ type: "text", value: type[1] }] },
      { type: "text", value: type[2] },
    ];
  },
};

export default defineConfig({
  site: "https://blog.estoc.dev",
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      transformers: [plainColumns],
    },
  },
});

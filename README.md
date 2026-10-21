# blog

The Estoc blog in Chinese and English, built with [Astro](https://astro.build). Every push to `main` is
deployed to <https://blog.estoc.dev> by GitHub Actions.

```bash
pnpm install
pnpm dev
```

Posts live in `src/content/posts/<lang>/<slug>.md`, where `<lang>` is `zh` or `en`, and are served at
`/<lang>/posts/<slug>/`. A translation uses the same slug in the other language's folder, which is how
the language switch finds it. The front matter holds `title`, `description` and `date` (`YYYY-MM-DD`).
Each language has its own index and RSS feed, newest first; `/` sends readers to the language their
browser prefers.

Chinese posts are in Traditional Chinese and keep technical terms in English. In both languages, avoid
absolutes such as "never" or 「永遠」「絕不」, and avoid dashes (em dashes, 破折號).

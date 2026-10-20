# blog-zh

Estoc 的中文博客，用 [Astro](https://astro.build) 建成靜態頁，推到 `main` 後由 GitHub Actions 部署到
<https://estoc-dev.github.io/blog-zh/>。

```bash
pnpm install
pnpm dev
```

文章放在 `src/content/posts/<slug>.md`，網址是 `/posts/<slug>/`。開頭的 front matter 寫 `title`、
`description` 與 `date`（`YYYY-MM-DD`），首頁與 RSS 按日期由新到舊排。

文字用繁體中文；技術名詞保留英文。不用「永遠」「絕不」這類絕對的說法，也不用破折號。

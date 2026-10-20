import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { href } from "../paths.ts";
import { byNewest } from "../posts.ts";

export async function GET(context: APIContext) {
  const posts = (await getCollection("posts")).sort(byNewest);
  return rss({
    title: "Estoc 中文",
    description: "Estoc 的設計筆記：離線優先的身份、資料與通訊。",
    site: new URL(href(), context.site),
    customData: "<language>zh-Hant</language>",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: href(`posts/${post.id}/`),
    })),
  });
}

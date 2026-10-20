import type { CollectionEntry } from "astro:content";

type Post = CollectionEntry<"posts">;

export const byNewest = (a: Post, b: Post) => b.data.date.valueOf() - a.data.date.valueOf();

export const dateText = (date: Date) =>
  `${date.getUTCFullYear()} 年 ${date.getUTCMonth() + 1} 月 ${date.getUTCDate()} 日`;

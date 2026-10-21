import { getCollection, type CollectionEntry } from "astro:content";
import { isLang, type Lang, type Translations } from "./i18n.ts";

export interface Post {
  readonly lang: Lang;
  readonly slug: string;
  readonly entry: CollectionEntry<"posts">;
}

const toPost = (entry: CollectionEntry<"posts">): Post => {
  const [lang, slug, ...rest] = entry.id.split("/");
  if (lang === undefined || !isLang(lang) || slug === undefined || rest.length > 0) {
    throw new Error(`Post ${entry.id} is not at <lang>/<slug>.md with a known language`);
  }
  return { lang, slug, entry };
};

export const allPosts = async () => (await getCollection("posts")).map(toPost);

export const postsIn = async (lang: Lang) =>
  (await allPosts())
    .filter((post) => post.lang === lang)
    .sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf());

export const postPath = (post: Post) => `/${post.lang}/posts/${post.slug}/`;

export const translationsOf = (post: Post, posts: readonly Post[]): Translations =>
  Object.fromEntries(posts.filter((other) => other.slug === post.slug).map((other) => [other.lang, postPath(other)]));

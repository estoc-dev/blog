import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { home, langs, locales, type Lang } from "../../i18n.ts";
import { postPath, postsIn } from "../../posts.ts";

export const getStaticPaths = () => langs.map((lang) => ({ params: { lang }, props: { lang } }));

export async function GET({ props, site }: APIContext<{ lang: Lang }>) {
  const { lang } = props;
  const posts = await postsIn(lang);
  return rss({
    title: "Estoc",
    description: locales[lang].description,
    site: new URL(home(lang), site),
    customData: `<language>${locales[lang].tag}</language>`,
    items: posts.map((post) => ({
      title: post.entry.data.title,
      description: post.entry.data.description,
      pubDate: post.entry.data.date,
      link: postPath(post),
    })),
  });
}

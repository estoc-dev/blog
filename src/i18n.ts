export const langs = ["zh", "en"] as const;

export type Lang = (typeof langs)[number];

export type Translations = Partial<Record<Lang, string>>;

interface Locale {
  readonly tag: string;
  readonly name: string;
  readonly description: string;
  readonly date: (date: Date) => string;
}

export const locales: Record<Lang, Locale> = {
  zh: {
    tag: "zh-Hant",
    name: "中文",
    description: "Estoc 的設計筆記：離線優先的身份、資料與通訊。",
    date: (date) => `${date.getUTCFullYear()} 年 ${date.getUTCMonth() + 1} 月 ${date.getUTCDate()} 日`,
  },
  en: {
    tag: "en",
    name: "English",
    description: "Design notes from Estoc: offline-first identity, data and messaging.",
    date: (date) => date.toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" }),
  },
};

export const isLang = (value: string): value is Lang => (langs as readonly string[]).includes(value);

export const home = (lang: Lang) => `/${lang}/`;

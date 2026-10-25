import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "content");

export type ArticleMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export type Article = ArticleMeta & {
  contentHtml: string;
  contentMarkdown: string;
};

function parseFrontmatter(data: Record<string, unknown>): {
  title: string;
  date: string;
  excerpt: string;
} {
  return {
    title: typeof data.title === "string" ? data.title : "Uden titel",
    date: typeof data.date === "string" ? data.date : "",
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
  };
}

export function getArticleSlugs(): string[] {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  return fs
    .readdirSync(contentDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getAllArticles(): ArticleMeta[] {
  return getArticleSlugs()
    .map((slug) => {
      const fullPath = path.join(contentDirectory, `${slug}.md`);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);
      const meta = parseFrontmatter(data);

      return {
        slug,
        ...meta,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const fullPath = path.join(contentDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const meta = parseFrontmatter(data);
  const processed = await remark().use(html).process(content);

  return {
    slug,
    ...meta,
    contentMarkdown: content,
    contentHtml: processed.toString(),
  };
}

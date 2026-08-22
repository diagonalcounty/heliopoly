/**
 * Ops Manual topics loaded from repo Markdown / HTML (build-time ?raw imports).
 * Handbook content may be TS (content.ts) or files in this module.
 */
import changelogRaw from "../../CHANGELOG.md?raw";
import readmeRaw from "../../README.md?raw";
import privacyRaw from "../../public/privacy.html?raw";
import type { HandbookSection, HandbookTopic } from "./content";
import { mdToHtml } from "./mdToHtml";

export function markdownTopic(
  id: string,
  title: string,
  md: string,
): HandbookTopic {
  return {
    id,
    title,
    html: mdToHtml(md),
  };
}

/** Inner HTML of <main> from a standalone page (privacy.html). */
export function htmlMainTopic(
  id: string,
  title: string,
  htmlDoc: string,
): HandbookTopic {
  const inner = htmlDoc.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? htmlDoc;
  const html = inner
    .replace(
      /<p class="sub">\s*<a href="https:\/\/heliopoly\.live\/">[\s\S]*?<\/p>/,
      "",
    )
    .replace(
      /<a href="(https?:[^"]+)"([^>]*)>/gi,
      (_full, href: string, rest: string) =>
        /target\s*=/i.test(rest)
          ? `<a href="${href}"${rest}>`
          : `<a href="${href}" target="_blank" rel="noopener"${rest}>`,
    )
    .trim();
  return { id, title, html };
}

export function projectDocsSection(): HandbookSection {
  return {
    id: "project-docs",
    title: "Project",
    topics: [
      markdownTopic("readme", "README", readmeRaw),
      markdownTopic("changelog", "CHANGELOG", changelogRaw),
      htmlMainTopic("privacy", "Privacy", privacyRaw),
    ],
  };
}

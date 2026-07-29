/**
 * Ops Manual topics loaded from repo Markdown (build-time ?raw imports).
 * Handbook content may be TS (content.ts) or MD (this module).
 */
import changelogRaw from "../../CHANGELOG.md?raw";
import readmeRaw from "../../README.md?raw";
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

export function projectDocsSection(): HandbookSection {
  return {
    id: "project-docs",
    title: "Project",
    topics: [
      markdownTopic("readme", "README", readmeRaw),
      markdownTopic("changelog", "CHANGELOG", changelogRaw),
    ],
  };
}

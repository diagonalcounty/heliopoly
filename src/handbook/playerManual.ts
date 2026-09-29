/**
 * Player-facing Ops Manual copies of README and CHANGELOG (#285).
 * GitHub keeps the developer files. The in-app topics drop build notes.
 */

/** Shell commands, package names, and native bundle words that stay off the manual. */
const BANNED_LINE =
  /\b(npm|WebDist|wrapper|ios:sync|WKWebView|MARKETING_VERSION|CURRENT_PROJECT_VERSION)\b/;

/** Changelog sections that are release machinery, not what changed in the game. */
const DROP_H3 =
  /^(ios|meta|ops|tooling|cleanup|ops & infra)\b/i;

function stripBuildLines(md: string): string {
  const lines = md.split("\n");
  const kept: string[] = [];
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (BANNED_LINE.test(line)) continue;
    kept.push(line);
  }
  return kept.join("\n").replace(/\n{3,}/g, "\n\n");
}

/** README up through how to play. Stack, sim lab, and board-preview notes stay on GitHub. */
export function playerReadmeMarkdown(md: string): string {
  const cut = md.search(/^## Stack\b/m);
  const head = cut === -1 ? md : md.slice(0, cut);
  const withoutLocal = head
    .split("\n")
    .filter((line) => !/^\|\s*\*\*Local\*\*/.test(line))
    .join("\n");
  return stripBuildLines(withoutLocal).trim() + "\n";
}

/** Changelog as release notes: play sections, including the 1.5.0 doors. */
export function playerChangelogMarkdown(md: string): string {
  const out: string[] = [];
  let drop = false;
  let inCode = false;
  for (const line of md.split("\n")) {
    if (/^## /.test(line)) drop = false;
    const h3 = /^### (.+)$/.exec(line);
    if (h3) {
      drop = DROP_H3.test(h3[1].trim());
      if (drop) continue;
    }
    if (drop) continue;
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (BANNED_LINE.test(line)) continue;
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

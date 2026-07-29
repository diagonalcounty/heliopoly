/**
 * Small Markdown → HTML for Ops Manual docs (README, CHANGELOG).
 * Supports headings, lists, links, bold/italic, fenced code, tables, hr, paragraphs.
 * Not a full CommonMark engine — enough for our repo .md files.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s: string): string {
  let t = escapeHtml(s);
  // code
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  // links [text](url)
  t = t.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>',
  );
  // bold ** / __
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  // italic * / _
  t = t.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  t = t.replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>");
  return t;
}

export function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let inCode = false;
  let codeBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let tableMode = false;
  let tableRows: string[][] = [];

  const closeList = () => {
    if (listType) {
      out.push(listType === "ul" ? "</ul>" : "</ol>");
      listType = null;
    }
  };

  const flushTable = () => {
    if (!tableRows.length) return;
    out.push('<table class="glossary">');
    tableRows.forEach((cells, ri) => {
      const tag = ri === 0 ? "th" : "td";
      out.push(
        `<tr>${cells.map((c) => `<${tag}>${inline(c.trim())}</${tag}>`).join("")}</tr>`,
      );
    });
    out.push("</table>");
    tableRows = [];
    tableMode = false;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      closeList();
      flushTable();
      if (!inCode) {
        inCode = true;
        codeBuf = [];
      } else {
        out.push(`<pre class="md-pre"><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
        inCode = false;
        codeBuf = [];
      }
      i++;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }

    // table row
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      closeList();
      const cells = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      // skip separator |---|
      if (/^[\s|:-]+$/.test(line)) {
        i++;
        continue;
      }
      tableMode = true;
      tableRows.push(cells);
      i++;
      continue;
    } else if (tableMode) {
      flushTable();
    }

    if (/^---+\s*$/.test(line.trim()) || /^\*\*\*+\s*$/.test(line.trim())) {
      closeList();
      out.push("<hr/>");
      i++;
      continue;
    }

    const hm = /^(#{1,4})\s+(.+)$/.exec(line);
    if (hm) {
      closeList();
      const level = hm[1].length;
      out.push(`<h${level}>${inline(hm[2])}</h${level}>`);
      i++;
      continue;
    }

    const ul = /^[-*+]\s+(.+)$/.exec(line);
    if (ul) {
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      i++;
      continue;
    }

    const ol = /^(\d+)\.\s+(.+)$/.exec(line);
    if (ol) {
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${inline(ol[2])}</li>`);
      i++;
      continue;
    }

    if (line.trim() === "") {
      closeList();
      i++;
      continue;
    }

    closeList();
    // paragraph: merge consecutive non-empty
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !lines[i].startsWith("```") &&
      !lines[i].trim().startsWith("|")
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }

  closeList();
  flushTable();
  if (inCode) {
    out.push(`<pre class="md-pre"><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
  }
  return `<div class="md-doc">${out.join("\n")}</div>`;
}

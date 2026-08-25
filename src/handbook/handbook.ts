import {
  DEFAULT_TOPIC_ID,
  getTopic,
  HANDBOOK_SECTIONS,
  sectionForTopic,
  type HandbookSection,
} from "./content";
import { sectionIcon, topicIcon } from "./icons";
import { liveTopicLegend, paintHandbookLegend } from "./legendCanvases";

const STORAGE_KEY = "solarquest.handbook.topic";
const SECTION_KEY = "solarquest.handbook.section";

export interface HandbookController {
  open: (topicId?: string) => void;
  close: () => void;
  isOpen: () => boolean;
}

export function mountHandbook(root: HTMLElement): HandbookController {
  let open = false;
  let currentId = migrateTopicId(safeStorageGet(STORAGE_KEY) ?? DEFAULT_TOPIC_ID);
  let currentSectionId =
    safeStorageGet(SECTION_KEY) ??
    sectionForTopic(currentId)?.id ??
    HANDBOOK_SECTIONS[0].id;
  let lastFocus: HTMLElement | null = null;

  root.innerHTML = `
    <div class="handbook-backdrop" data-handbook-close tabindex="-1"></div>
    <div
      class="handbook-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="handbook-title"
    >
      <header class="handbook-header">
        <div class="handbook-header-brand">
          <img
            class="ops-manual-icon handbook-header-icon"
            src="/ops-manual-icon.png"
            alt=""
            width="56"
            height="56"
            decoding="async"
          />
          <div>
            <p class="handbook-kicker">Heliopoly · Orbital Economics</p>
            <h2 id="handbook-title">Helios Ops Manual</h2>
          </div>
        </div>
        <button type="button" class="handbook-close" aria-label="Close handbook">✕</button>
      </header>
      <div class="handbook-section-tabs" role="tablist" aria-label="Manual sections"></div>
      <div class="handbook-body">
        <nav class="handbook-toc" aria-label="Topics in this section"></nav>
        <article class="handbook-article"></article>
      </div>
    </div>
  `;

  const tabsEl = root.querySelector(".handbook-section-tabs") as HTMLElement;
  const toc = root.querySelector(".handbook-toc") as HTMLElement;
  const article = root.querySelector(".handbook-article") as HTMLElement;
  const closeBtn = root.querySelector(".handbook-close") as HTMLButtonElement;
  const backdrop = root.querySelector(".handbook-backdrop") as HTMLElement;
  const panel = root.querySelector(".handbook-panel") as HTMLElement;

  /** Last topic opened per section (Civ: stay on unit when you return to Units). */
  const sectionMemory = new Map<string, string>();
  for (const s of HANDBOOK_SECTIONS) {
    sectionMemory.set(s.id, s.topics[0]?.id ?? DEFAULT_TOPIC_ID);
  }
  const initialSec = sectionForTopic(currentId);
  if (initialSec) {
    currentSectionId = initialSec.id;
    sectionMemory.set(initialSec.id, currentId);
  }

  for (const section of HANDBOOK_SECTIONS) {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "handbook-section-tab";
    tab.role = "tab";
    tab.dataset.sectionId = section.id;
    tab.id = `handbook-tab-${section.id}`;
    tab.setAttribute("aria-controls", "handbook-topic-panel");
    const iconSrc = sectionIcon(section.id);
    if (iconSrc) {
      const img = document.createElement("img");
      img.src = iconSrc;
      img.alt = "";
      img.className = "handbook-tab-icon";
      img.width = 22;
      img.height = 22;
      img.decoding = "async";
      tab.appendChild(img);
    }
    const label = document.createElement("span");
    label.textContent = section.title;
    tab.appendChild(label);
    tab.addEventListener("click", () => selectSection(section.id));
    tabsEl.appendChild(tab);
  }

  toc.id = "handbook-topic-panel";
  toc.setAttribute("role", "tabpanel");

  function activeSection(): HandbookSection {
    return (
      HANDBOOK_SECTIONS.find((s) => s.id === currentSectionId) ??
      HANDBOOK_SECTIONS[0]
    );
  }

  function renderTopicList(): void {
    const section = activeSection();
    toc.innerHTML = "";
    toc.setAttribute("aria-labelledby", `handbook-tab-${section.id}`);
    for (const topic of section.topics) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "handbook-toc-item";
      btn.dataset.topicId = topic.id;
      const live = liveTopicLegend(topic.id);
      if (live) {
        const canvas = document.createElement("canvas");
        canvas.className = "handbook-toc-icon";
        canvas.dataset.legend = live;
        canvas.dataset.w = "28";
        canvas.dataset.h = "28";
        canvas.setAttribute("aria-hidden", "true");
        btn.appendChild(canvas);
      } else {
        const iconSrc = topicIcon(topic.id);
        if (iconSrc) {
          const img = document.createElement("img");
          img.src = iconSrc;
          img.alt = "";
          img.className = "handbook-toc-icon";
          img.width = 28;
          img.height = 28;
          img.decoding = "async";
          btn.appendChild(img);
        }
      }
      const label = document.createElement("span");
      label.className = "handbook-toc-label";
      label.textContent = topic.title;
      btn.appendChild(label);
      btn.addEventListener("click", () => selectTopic(topic.id));
      toc.appendChild(btn);
    }
    paintHandbookLegend(toc);
  }

  function syncTabChrome(): void {
    tabsEl.querySelectorAll(".handbook-section-tab").forEach((el) => {
      const btn = el as HTMLButtonElement;
      const on = btn.dataset.sectionId === currentSectionId;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
    });
  }

  function selectSection(sectionId: string): void {
    const section = HANDBOOK_SECTIONS.find((s) => s.id === sectionId);
    if (!section) return;
    currentSectionId = section.id;
    safeStorageSet(SECTION_KEY, currentSectionId);
    const remembered =
      sectionMemory.get(section.id) ?? section.topics[0]?.id ?? DEFAULT_TOPIC_ID;
    const topicId = section.topics.some((t) => t.id === remembered)
      ? remembered
      : section.topics[0].id;
    renderTopicList();
    syncTabChrome();
    selectTopic(topicId);
  }

  function selectTopic(id: string): void {
    let topic = getTopic(id);
    if (!topic) {
      topic = getTopic(DEFAULT_TOPIC_ID)!;
      id = topic.id;
    }
    const section = sectionForTopic(topic.id);
    if (section && section.id !== currentSectionId) {
      currentSectionId = section.id;
      safeStorageSet(SECTION_KEY, currentSectionId);
      renderTopicList();
      syncTabChrome();
    }
    currentId = topic.id;
    sectionMemory.set(currentSectionId, currentId);
    safeStorageSet(STORAGE_KEY, currentId);

    const sec = activeSection();
    const liveArt = liveTopicLegend(topic.id);
    const artIcon = liveArt ? null : topicIcon(topic.id);
    const iconHtml = liveArt
      ? `<canvas class="handbook-article-icon" data-legend="${liveArt}" data-w="72" data-h="72" aria-hidden="true"></canvas>`
      : artIcon
        ? `<img class="handbook-article-icon" src="${artIcon}" alt="" width="72" height="72" decoding="async" />`
        : "";
    const titleBlock = iconHtml
      ? `<div class="handbook-article-title-row">
          ${iconHtml}
          <div>
            <p class="handbook-article-section">${sec.title}</p>
            <h3>${topic.title}</h3>
          </div>
        </div>`
      : `<p class="handbook-article-section">${sec.title}</p><h3>${topic.title}</h3>`;
    article.innerHTML = `${titleBlock}${topic.html}`;
    paintHandbookLegend(article);
    toc.querySelectorAll(".handbook-toc-item").forEach((el) => {
      el.classList.toggle(
        "active",
        (el as HTMLElement).dataset.topicId === currentId,
      );
    });
    article.scrollTop = 0;
  }

  function otherOverlayOpen(): boolean {
    const duel = document.getElementById("duel-root");
    const lab = document.getElementById("lab-root");
    const end = document.getElementById("end-root");
    const eac = document.getElementById("eac-root");
    return (
      (!!duel && !duel.classList.contains("hidden")) ||
      (!!lab && !lab.classList.contains("hidden")) ||
      (!!end && !end.classList.contains("hidden")) ||
      (!!eac && !eac.classList.contains("hidden"))
    );
  }

  function setOpen(next: boolean): void {
    open = next;
    root.classList.toggle("hidden", !open);
    root.setAttribute("aria-hidden", open ? "false" : "true");
    // Keep body scroll locked if duel/lab/end is still up under the manual
    document.body.classList.toggle("handbook-open", open || otherOverlayOpen());
    if (open) {
      lastFocus = document.activeElement as HTMLElement | null;
      if (!getTopic(currentId)) currentId = DEFAULT_TOPIC_ID;
      const sec = sectionForTopic(currentId);
      currentSectionId = sec?.id ?? HANDBOOK_SECTIONS[0].id;
      renderTopicList();
      syncTabChrome();
      selectTopic(currentId);
      closeBtn.focus();
    } else if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  function onKey(e: KeyboardEvent): void {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    // Arrow left/right between section tabs when focus is on a tab
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const tabs = [...tabsEl.querySelectorAll(".handbook-section-tab")];
      const i = tabs.findIndex((t) => t === document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const next =
        e.key === "ArrowRight"
          ? (i + 1) % tabs.length
          : (i - 1 + tabs.length) % tabs.length;
      const btn = tabs[next] as HTMLButtonElement;
      btn.focus();
      selectSection(btn.dataset.sectionId!);
    }
  }

  closeBtn.addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  panel.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("keydown", onKey);

  renderTopicList();
  syncTabChrome();
  setOpen(false);

  return {
    open(topicId?: string) {
      if (topicId && getTopic(topicId)) {
        currentId = migrateTopicId(topicId);
        const sec = sectionForTopic(currentId);
        if (sec) currentSectionId = sec.id;
      }
      setOpen(true);
    },
    close() {
      setOpen(false);
    },
    isOpen() {
      return open;
    },
  };
}

function migrateTopicId(id: string): string {
  if (id === "rival-pilots") return "rival-pilots-overview";
  if (id === "charter-alerts") return "ledger-alerts";
  return id;
}

function safeStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, id: string): void {
  try {
    localStorage.setItem(key, id);
  } catch {
    /* private mode */
  }
}

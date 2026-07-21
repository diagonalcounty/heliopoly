import {
  DEFAULT_TOPIC_ID,
  getTopic,
  HANDBOOK_TOPICS,
} from "./content";

const STORAGE_KEY = "solarquest.handbook.topic";

export interface HandbookController {
  open: (topicId?: string) => void;
  close: () => void;
  isOpen: () => boolean;
}

export function mountHandbook(root: HTMLElement): HandbookController {
  let open = false;
  let currentId =
    safeStorageGet() ?? DEFAULT_TOPIC_ID;
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
        <div>
          <p class="handbook-kicker">Heliopoly · Free Enterprise In Space</p>
          <h2 id="handbook-title">Helios Ops Manual</h2>
        </div>
        <button type="button" class="handbook-close" aria-label="Close handbook">✕</button>
      </header>
      <div class="handbook-body">
        <nav class="handbook-toc" aria-label="Handbook topics"></nav>
        <article class="handbook-article"></article>
      </div>
    </div>
  `;

  const toc = root.querySelector(".handbook-toc") as HTMLElement;
  const article = root.querySelector(".handbook-article") as HTMLElement;
  const closeBtn = root.querySelector(".handbook-close") as HTMLButtonElement;
  const backdrop = root.querySelector(".handbook-backdrop") as HTMLElement;
  const panel = root.querySelector(".handbook-panel") as HTMLElement;

  for (const topic of HANDBOOK_TOPICS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "handbook-toc-item";
    btn.dataset.topicId = topic.id;
    btn.textContent = topic.title;
    btn.addEventListener("click", () => selectTopic(topic.id));
    toc.appendChild(btn);
  }

  function selectTopic(id: string): void {
    const topic = getTopic(id) ?? getTopic(DEFAULT_TOPIC_ID)!;
    currentId = topic.id;
    safeStorageSet(currentId);
    article.innerHTML = `<h3>${topic.title}</h3>${topic.html}`;
    toc.querySelectorAll(".handbook-toc-item").forEach((el) => {
      el.classList.toggle(
        "active",
        (el as HTMLElement).dataset.topicId === currentId,
      );
    });
    article.scrollTop = 0;
  }

  function setOpen(next: boolean): void {
    open = next;
    root.classList.toggle("hidden", !open);
    root.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("handbook-open", open);
    if (open) {
      lastFocus = document.activeElement as HTMLElement | null;
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
    }
  }

  closeBtn.addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  // Clicks on panel content must not close; backdrop is sibling, not parent of panel clicks.
  panel.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("keydown", onKey);

  // Start hidden
  setOpen(false);
  selectTopic(currentId);

  return {
    open(topicId?: string) {
      if (topicId && getTopic(topicId)) currentId = topicId;
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

function safeStorageGet(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeStorageSet(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* private mode */
  }
}

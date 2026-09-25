import { type Page, expect } from "@playwright/test";

export const PHONE = { w: 390, h: 844 };

export type Hit = {
  tag: string;
  id: string;
  className: string;
};

/** Dismiss a resource-strike card before the hit (#283). It can cover Roll. */
export async function hitAt(page: Page, x: number, y: number): Promise<Hit | null> {
  return page.evaluate(({ x, y }) => {
    const announce = document.getElementById("announce-root");
    if (announce && !announce.classList.contains("hidden")) {
      (document.getElementById("announce-ok") as HTMLButtonElement | null)?.click();
    }
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) return null;
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id,
      className: typeof el.className === "string" ? el.className : "",
    };
  }, { x, y });
}

/** Hit-test the control's own client rect (avoids Playwright box vs layout skew). */
export async function hitOn(
  page: Page,
  sel: string,
): Promise<{
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: string;
  pointerEvents: string;
  display: string;
  center: Hit | null;
  onControl: boolean;
}> {
  return page.locator(sel).first().evaluate((el) => {
    const announce = document.getElementById("announce-root");
    if (
      announce &&
      !announce.classList.contains("hidden") &&
      !announce.contains(el)
    ) {
      (document.getElementById("announce-ok") as HTMLButtonElement | null)?.click();
    }
    const r = el.getBoundingClientRect();
    const x = r.x + r.width / 2;
    const y = r.y + r.height / 2;
    const top = document.elementFromPoint(x, y) as HTMLElement | null;
    const s = getComputedStyle(el);
    const dump = (n: HTMLElement | null) =>
      n
        ? {
            tag: n.tagName.toLowerCase(),
            id: n.id,
            className: typeof n.className === "string" ? n.className : "",
          }
        : null;
    return {
      x,
      y,
      top: r.y,
      width: r.width,
      height: r.height,
      zIndex: s.zIndex,
      pointerEvents: s.pointerEvents,
      display: s.display,
      center: dump(top),
      onControl: !!(top && (top === el || el.contains(top))),
    };
  });
}

export async function boxOf(page: Page, sel: string) {
  await expect(page.locator(sel).first()).toBeVisible();
  return hitOn(page, sel);
}

export async function cssOf(page: Page, sel: string) {
  return page.locator(sel).first().evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      zIndex: s.zIndex,
      pointerEvents: s.pointerEvents,
      display: s.display,
    };
  });
}

export async function centerOf(page: Page, sel: string) {
  const b = await boxOf(page, sel);
  return { x: b.x, y: b.y, ...b };
}

async function primePage(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("heliopoly-anim-speed", "instant");
    } catch {
      /* private mode */
    }
  });
}

/** Cold load on the three home doors. Does not enter the charter. */
export async function bootHome(page: Page) {
  await primePage(page);
  await page.goto("/");
  await expect(page.locator("#home-root")).toHaveAttribute("data-ready", "1");
  await expect(page.locator("#home-root")).not.toHaveClass(/hidden/);
  await expect(page.locator("#door-arcade")).toBeVisible();
}

/** Charter setup. Home is the cold screen; Journey is the charter door. */
export async function bootSetup(page: Page) {
  await bootHome(page);
  await page.locator("#door-journey").click();
  await expect(page.locator("#home-root")).toHaveClass(/hidden/);
  await expect(page.locator("#btn-new")).toBeVisible();
  await page.waitForFunction(() => {
    const r = document.getElementById("btn-new")?.getBoundingClientRect();
    return !!r && r.height >= 24 && r.width >= 80;
  });
}

export async function launch(page: Page) {
  await bootSetup(page);
  await page.locator("#btn-new").click();
  await expect(page.locator("#fleet-card")).toHaveClass(/mode-standings/);
  await page.evaluate(() => {
    const announce = document.getElementById("announce-root");
    if (announce && !announce.classList.contains("hidden")) {
      (document.getElementById("announce-ok") as HTMLButtonElement | null)?.click();
    }
  });
}

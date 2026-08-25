import { test, expect } from "@playwright/test";
import {
  PHONE,
  boxOf,
  bootSetup,
  centerOf,
  cssOf,
  hitAt,
  launch,
} from "./hit";

const HIDDEN_SHEETS = [
  "#handbook-root",
  "#dossier-root",
  "#duel-root",
  "#auction-root",
  "#announce-root",
  "#end-root",
];

test.describe("phone setup #158", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("Launch is in the first viewport and receives the tap", async ({
    page,
  }) => {
    await bootSetup(page);
    const scrollH = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(scrollH, "no page scroll at 390×844").toBeLessThanOrEqual(PHONE.h + 2);

    const launchBtn = await boxOf(page, "#btn-new");
    expect(launchBtn.height, "Launch ≥56px").toBeGreaterThanOrEqual(56);
    expect(launchBtn.top + launchBtn.height).toBeLessThanOrEqual(PHONE.h + 1);
    expect(launchBtn.pointerEvents).not.toBe("none");
    expect(launchBtn.onControl, "elementFromPoint Launch center").toBe(true);
    expect(launchBtn.center?.id).toBe("btn-new");
  });
});

test.describe("phone play thumbs #157 #166", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("after Launch: Roll / Book / End on screen; telemetry not a chip", async ({
    page,
  }) => {
    await launch(page);

    for (const sel of ["#btn-roll", "#btn-handbook-header", "#btn-end"]) {
      const b = await boxOf(page, sel);
      expect(b.height, `${sel} thumb height`).toBeGreaterThanOrEqual(44);
      expect(b.top, `${sel} on screen`).toBeGreaterThanOrEqual(0);
      expect(b.top + b.height).toBeLessThanOrEqual(PHONE.h + 2);
    }

    const tel = await cssOf(page, "#telemetry");
    expect(tel.display, "#telemetry hidden on phone bar").toBe("none");
  });
});

test.describe("phone Book sheet #160", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("Book is full-bleed; close is 44px; Roll is under the sheet", async ({
    page,
  }) => {
    await launch(page);

    const roll = await centerOf(page, "#btn-roll");

    await page.locator("#btn-handbook-header").click();
    await expect(page.locator("#handbook-root")).not.toHaveClass(/hidden/);

    const root = await boxOf(page, "#handbook-root");
    expect(Number(root.zIndex), "sheet z-index").toBeGreaterThanOrEqual(2000);
    expect(root.width, "full-bleed width").toBeGreaterThanOrEqual(PHONE.w - 1);
    expect(root.height, "full-bleed height").toBeGreaterThanOrEqual(PHONE.h - 2);
    expect(root.top).toBeLessThanOrEqual(1);

    const panel = await boxOf(page, "#handbook-root .handbook-panel");
    expect(panel.width).toBeGreaterThanOrEqual(PHONE.w - 1);
    expect(panel.height).toBeGreaterThanOrEqual(PHONE.h - 2);

    const close = await boxOf(page, "#handbook-root .handbook-close");
    expect(close.width, "close width").toBeGreaterThanOrEqual(44);
    expect(close.height, "close height").toBeGreaterThanOrEqual(44);
    expect(close.onControl, "elementFromPoint close center").toBe(true);
    expect(close.center?.className ?? "").toContain("handbook-close");

    const overRoll = await hitAt(page, roll.x, roll.y);
    expect(overRoll?.id, "Roll must not win hit-test under open Book").not.toBe(
      "btn-roll",
    );

    const tocItems = page.locator("#handbook-root .handbook-toc-item");
    await expect(tocItems).not.toHaveCount(0);
    const last = tocItems.last();
    const lastBox = await last.boundingBox();
    expect(lastBox, "last topic chip has a box").toBeTruthy();
    expect((lastBox?.x ?? 0) + (lastBox?.width ?? 0)).toBeLessThanOrEqual(
      PHONE.w + 8,
    );

    await page.locator("#handbook-root .handbook-close").click();
    await expect(page.locator("#handbook-root")).toHaveClass(/hidden/);

    const rollAfter = await hitAt(page, roll.x, roll.y);
    expect(rollAfter?.id, "Roll tappable after close").toBe("btn-roll");
  });

  test("hidden sheets do not steal taps", async ({ page }) => {
    await launch(page);
    for (const sel of HIDDEN_SHEETS) {
      const css = await cssOf(page, sel);
      expect(
        css.pointerEvents === "none" || css.display === "none",
        `${sel} must not steal taps`,
      ).toBe(true);
    }
  });
});

test.describe("wide handbook", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1100, "wide only");

  test("Ops Manual stays a framed panel", async ({ page }) => {
    await launch(page);
    await page.locator("#btn-handbook-header").click();
    await expect(page.locator("#handbook-root")).not.toHaveClass(/hidden/);
    const panel = await boxOf(page, "#handbook-root .handbook-panel");
    expect(panel.width, "framed width ~860").toBeLessThanOrEqual(880);
    expect(panel.width).toBeGreaterThan(600);
    expect(panel.height, "framed height ~704 at 800px").toBeLessThan(800);
  });
});

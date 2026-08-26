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

test.describe("phone setup pilots #170", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("Pilots chips are on the first viewport; Launch still receives the tap", async ({
    page,
  }) => {
    await bootSetup(page);

    const chips = page.locator("#pilot-count-chips button");
    await expect(chips).toHaveCount(5);
    const six = await boxOf(page, '#pilot-count-chips [data-players="6"]');
    expect(six.height, "chip ≥44px").toBeGreaterThanOrEqual(44);
    expect(six.top + six.height).toBeLessThanOrEqual(PHONE.h + 1);
    expect(six.onControl, "chip tappable").toBe(true);

    const launchBtn = await boxOf(page, "#btn-new");
    expect(launchBtn.top + launchBtn.height).toBeLessThanOrEqual(PHONE.h + 1);
    expect(launchBtn.onControl, "Launch still tappable").toBe(true);

    const scrollH = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(scrollH, "no page scroll with Pilots chips").toBeLessThanOrEqual(
      PHONE.h + 2,
    );
  });

  test("chip 6 launches a six-rocket roster with tanks", async ({ page }) => {
    await bootSetup(page);
    await page.locator('#pilot-count-chips [data-players="6"]').click();
    await page.locator("#btn-new").click();
    await expect(page.locator("#fleet-card")).toHaveClass(/mode-standings/);

    const rows = page.locator("#rankings .rank-row");
    await expect(rows).toHaveCount(6);

    const bar = await cssOf(page, "#rankings .rank-row .fuel-bar");
    expect(bar.display, "tanks visible after Launch").not.toBe("none");

    const board = await boxOf(page, "#board");
    const roster = await boxOf(page, ".fleet-card.mode-standings");
    expect(board.height, "circle stays on the board with 6 rows").toBeGreaterThanOrEqual(
      240,
    );
    expect(board.top + board.height).toBeLessThanOrEqual(roster.top + 2);
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

const NINE_ROCKETS = [
  "The Ada",
  "The Recorde",
  "The K-127",
  "The Turing",
  "The Sagan",
  "The Asimov",
  "The Clarke",
  "The Goddard",
  "The von Braun",
];

test.describe("phone roster #168", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("after Launch: every rank-row is a compact on-screen roster; circle stays above it", async ({
    page,
  }) => {
    await launch(page);

    await page.evaluate((names) => {
      const root = document.getElementById("rankings");
      if (!root) return;
      root.innerHTML = names
        .map((name, i) => {
          const active = i === 0 ? " active" : "";
          return `<div class="rank-row rank-open${active}" data-dossier-id="p${i}" role="button" tabindex="0"><div class="swatch" style="background:#6ec8ff" aria-hidden="true"></div><div class="rank-body"><div class="rank-top"><span class="rank-id">#${i + 1} ${name} · <span class="rank-prop">CH4</span></span><span class="rank-money"><span class="cash">⍺1000 cash</span> · NW ⍺2000</span></div><div class="rank-detail"><span class="fuel-bar">●●</span> <span class="fuel-n">11</span> fuel · 0 claims · Earth</div></div></div>`;
        })
        .join("");
    }, NINE_ROCKETS);

    const rows = page.locator("#rankings .rank-row");
    await expect(rows).toHaveCount(9);

    const roster = await boxOf(page, ".fleet-card.mode-standings");
    expect(roster.height, "roster is not a 28dvh scroll hunt").toBeLessThanOrEqual(
      200,
    );
    expect(roster.top + roster.height).toBeLessThanOrEqual(PHONE.h + 2);

    const board = await boxOf(page, "#board");
    expect(board.height, "circle still on the board").toBeGreaterThanOrEqual(240);
    expect(board.top + board.height, "circle stays above the roster").toBeLessThanOrEqual(
      roster.top + 2,
    );

    for (const sel of ["#btn-roll", "#btn-handbook-header", "#btn-end"]) {
      const b = await boxOf(page, sel);
      expect(b.height, `${sel} ≥56px`).toBeGreaterThanOrEqual(56);
      expect(roster.top + roster.height, "roster above thumbs").toBeLessThanOrEqual(
        b.top + 4,
      );
    }

    const geom = await page.evaluate(() => {
      const list = [...document.querySelectorAll<HTMLElement>("#rankings .rank-row")];
      return list.map((row) => {
        const r = row.getBoundingClientRect();
        const swatch = row.querySelector<HTMLElement>(".swatch");
        const name = row.querySelector<HTMLElement>(".rank-id");
        const cash = row.querySelector<HTMLElement>(".cash");
        const fuelBar = row.querySelector<HTMLElement>(".fuel-bar");
        const fuelN = row.querySelector<HTMLElement>(".fuel-n");
        const prop = row.querySelector<HTMLElement>(".rank-prop");
        const cs = (el: HTMLElement | null) =>
          el ? getComputedStyle(el) : null;
        const nameCs = cs(name);
        const cashCs = cs(cash);
        const barCs = cs(fuelBar);
        const propCs = cs(prop);
        const swCs = cs(swatch);
        const fuelCs = cs(fuelN);
        return {
          top: r.top,
          bottom: r.bottom,
          height: r.height,
          swatchDisplay: swCs?.display,
          nameDisplay: nameCs?.display,
          nameText: name?.textContent ?? "",
          cashDisplay: cashCs?.display,
          cashFont: cashCs?.fontSize,
          barDisplay: barCs?.display,
          propDisplay: propCs?.display,
          fuelDisplay: fuelCs?.display,
          fuelFont: fuelCs?.fontSize,
        };
      });
    });

    expect(geom).toHaveLength(9);
    for (const [i, g] of geom.entries()) {
      expect(g.height, `row ${i} compact`).toBeGreaterThan(0);
      expect(g.height, `row ${i} compact`).toBeLessThanOrEqual(24);
      expect(g.top, `row ${i} on screen`).toBeGreaterThanOrEqual(roster.top - 1);
      expect(g.bottom, `row ${i} in roster`).toBeLessThanOrEqual(roster.top + roster.height + 1);
      expect(g.swatchDisplay, `row ${i} swatch`).not.toBe("none");
      expect(g.nameDisplay, `row ${i} name`).not.toBe("none");
      expect(g.nameText).toContain(NINE_ROCKETS[i]);
      expect(g.cashDisplay, `row ${i} cash`).not.toBe("none");
      expect(Number.parseFloat(g.cashFont ?? "0"), `row ${i} cash readable`).toBeGreaterThan(
        8,
      );
      expect(g.barDisplay, "fuel tanks on every row").not.toBe("none");
      expect(g.propDisplay, "no propellant chip").toBe("none");
      expect(g.fuelDisplay, "numeric fuel-n hidden; tanks carry fuel").toBe(
        "none",
      );
    }

    const tel = await cssOf(page, "#telemetry");
    expect(tel.display, "#telemetry hidden").toBe("none");

    const roll = await centerOf(page, "#btn-roll");
    const overRoll = await hitAt(page, roll.x, roll.y);
    expect(overRoll?.id, "thumbs do not open dossier").toBe("btn-roll");
  });

  test("Break / course sit above the 56px thumbs when legal", async ({ page }) => {
    await launch(page);

    const idle = await boxOf(page, "#break-row");
    expect(idle.display, "Break stays in layout when idle").not.toBe("none");
    expect(idle.height, "idle Break still ≥44px").toBeGreaterThanOrEqual(44);

    await page.evaluate(() => {
      document.getElementById("break-row")?.classList.remove("hidden-vis");
    });

    const br = await boxOf(page, "#break-row");
    const roll = await boxOf(page, "#btn-roll");
    expect(br.display, "do not display:none Break when legal").not.toBe("none");
    expect(br.height, "Break ≥44px").toBeGreaterThanOrEqual(44);
    expect(Math.abs(br.top - idle.top), "roster does not jump when Break arms").toBeLessThanOrEqual(
      2,
    );
    expect(roll.height, "Roll stays ≥56px").toBeGreaterThanOrEqual(56);
    expect(br.top + br.height, "Break above Roll").toBeLessThanOrEqual(roll.top + 2);
    expect(br.top + br.height).toBeLessThanOrEqual(PHONE.h + 2);
    expect(br.onControl, "Break tappable").toBe(true);
  });
});

test.describe("phone Refuel #172", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("legal Refuel is a full-width row above Roll; thumbs stay three", async ({
    page,
  }) => {
    await launch(page);

    const boardBefore = await boxOf(page, "#board");
    const rollBefore = await boxOf(page, "#btn-roll");

    await page.evaluate(() => {
      const el = document.getElementById("btn-refuel") as HTMLButtonElement | null;
      if (el) el.disabled = false;
    });

    const refuel = await boxOf(page, "#btn-refuel");
    const roll = await boxOf(page, "#btn-roll");
    const end = await boxOf(page, "#btn-end");
    const board = await boxOf(page, "#board");
    expect(refuel.display, "do not hide Refuel when legal").not.toBe("none");
    expect(refuel.height, "Refuel ≥44px").toBeGreaterThanOrEqual(44);
    expect(refuel.width, "full-width extra, not a fourth thumb").toBeGreaterThan(
      PHONE.w * 0.7,
    );
    expect(refuel.top + refuel.height, "Refuel above Roll").toBeLessThanOrEqual(
      roll.top + 2,
    );
    expect(roll.height, "Roll stays ≥56px").toBeGreaterThanOrEqual(56);
    expect(end.height, "End stays ≥56px").toBeGreaterThanOrEqual(56);
    expect(roll.top + roll.height).toBeLessThanOrEqual(PHONE.h + 2);
    expect(refuel.onControl, "Refuel tappable").toBe(true);
    expect(
      Math.abs(board.height - boardBefore.height),
      "circle does not rescale when Refuel arms",
    ).toBeLessThanOrEqual(2);
    expect(
      Math.abs(roll.top - rollBefore.top),
      "thumbs do not jump when Refuel arms",
    ).toBeLessThanOrEqual(2);

    const sell = await cssOf(page, "#btn-sell");
    expect(sell.display, "Sell stays off the bar").toBe("none");
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

import { test, expect, type Page } from "@playwright/test";
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
  "#lab-root",
  "#eac-root",
  "#botevo-root",
  "#pipes-root",
  "#tiles-root",
  "#urp-root",
  "#deseret-root",
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

test.describe("phone setup expedition #195", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("Insight / Curiosity / Voyager / Opportunity; no μ meter; Launch stays", async ({
    page,
  }) => {
    await bootSetup(page);

    expect(await page.locator("#duration-meter").count(), "μ meter gone").toBe(0);

    const labels = await page.evaluate(() => {
      const names = ["easy", "normal", "hard", "expert"] as const;
      return names.map((value) => {
        const el = document.querySelector(
          `.ai-difficulty-field .check:has([value="${value}"])`,
        );
        if (!el) return `${value}:missing`;
        return getComputedStyle(el, "::after").content.replace(/"/g, "");
      });
    });
    expect(labels).toEqual([
      "1. Insight",
      "2. Curiosity",
      "3. Voyager",
      "4. Opportunity",
    ]);

    const curiosity = page.locator(
      '.ai-difficulty-field input[name="ai-difficulty"][value="normal"]',
    );
    await expect(curiosity).toBeChecked();

    const launchBtn = await boxOf(page, "#btn-new");
    expect(launchBtn.top + launchBtn.height).toBeLessThanOrEqual(PHONE.h + 1);
    expect(launchBtn.onControl, "Launch still tappable").toBe(true);
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

test.describe("phone Lab sheet #193", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("setup: Lab is tappable; Launch stays in the first viewport", async ({
    page,
  }) => {
    await bootSetup(page);

    const lab = await boxOf(page, "#btn-lab");
    expect(lab.height, "Lab ≥44px").toBeGreaterThanOrEqual(44);
    expect(lab.top + lab.height).toBeLessThanOrEqual(PHONE.h + 1);
    expect(lab.onControl, "elementFromPoint Lab center").toBe(true);
    expect(lab.center?.id).toBe("btn-lab");

    const launchBtn = await boxOf(page, "#btn-new");
    expect(launchBtn.top + launchBtn.height).toBeLessThanOrEqual(PHONE.h + 1);
    expect(launchBtn.onControl, "Launch still tappable").toBe(true);
  });

  test("play: Lab opens full-bleed; drill then close returns Roll", async ({
    page,
  }) => {
    await launch(page);

    const labBtn = await boxOf(page, "#btn-lab");
    expect(labBtn.height, "play Lab ≥44px").toBeGreaterThanOrEqual(44);
    expect(labBtn.top + labBtn.height).toBeLessThanOrEqual(PHONE.h + 2);
    expect(labBtn.onControl, "elementFromPoint Lab on play").toBe(true);

    const roll = await centerOf(page, "#btn-roll");

    await page.locator("#btn-lab").click();
    await expect(page.locator("#lab-root")).not.toHaveClass(/hidden/);

    const root = await boxOf(page, "#lab-root");
    expect(Number(root.zIndex), "Lab z-index").toBeGreaterThanOrEqual(2000);
    expect(root.width, "Lab full-bleed width").toBeGreaterThanOrEqual(PHONE.w - 1);
    expect(root.height, "Lab full-bleed height").toBeGreaterThanOrEqual(PHONE.h - 2);

    const close = await boxOf(page, "#lab-root .handbook-close");
    expect(close.width, "Lab close width").toBeGreaterThanOrEqual(44);
    expect(close.height, "Lab close height").toBeGreaterThanOrEqual(44);
    expect(close.onControl, "elementFromPoint Lab close").toBe(true);

    const overRoll = await hitAt(page, roll.x, roll.y);
    expect(overRoll?.id, "Roll must not win under open Lab").not.toBe("btn-roll");

    await page.locator('.lab-group-toggle[aria-controls="lab-group-items-which-is-larger"]').click();
    await page.locator('.lab-scenario[data-scenario="eastern-arabic-compare"]').click();
    await expect(page.locator("#eac-root")).not.toHaveClass(/hidden/);

    const eac = await boxOf(page, "#eac-root");
    expect(Number(eac.zIndex), "drill above Lab").toBeGreaterThanOrEqual(2000);
    expect(eac.width).toBeGreaterThanOrEqual(PHONE.w - 1);
    expect(eac.height).toBeGreaterThanOrEqual(PHONE.h - 2);

    const leftNum = await boxOf(page, "#eac-left");
    const rightNum = await boxOf(page, "#eac-right");
    expect(leftNum.onControl, "left number tappable").toBe(true);
    expect(rightNum.onControl, "right number tappable").toBe(true);
    expect(
      Math.abs(leftNum.top - rightNum.top),
      "numbers share a row, not stacked",
    ).toBeLessThan(12);
    expect(leftNum.x, "left is left of right").toBeLessThan(rightNum.x);

    const eacClose = await boxOf(page, "#eac-root .handbook-close");
    expect(eacClose.height).toBeGreaterThanOrEqual(44);
    expect(eacClose.onControl, "elementFromPoint drill close").toBe(true);

    await page.locator("#eac-root .handbook-close").click();
    await expect(page.locator("#eac-root")).toHaveClass(/hidden/);
    await expect(page.locator("#lab-root")).not.toHaveClass(/hidden/);

    await page.locator("#lab-root .handbook-close").click();
    await expect(page.locator("#lab-root")).toHaveClass(/hidden/);

    const rollAfter = await hitAt(page, roll.x, roll.y);
    expect(rollAfter?.id, "Roll tappable after Lab close").toBe("btn-roll");
  });

  test("minigame cards do not clip blurbs", async ({ page }) => {
    await launch(page);
    await page.locator("#btn-lab").click();
    await page
      .locator('.lab-group-toggle[aria-controls="lab-group-items-minigame"]')
      .click();
    await expect(page.locator("#lab-group-items-minigame")).toBeVisible();

    const report = await page.evaluate(() => {
      const cards = [
        ...document.querySelectorAll("#lab-group-items-minigame .lab-scenario"),
      ] as HTMLElement[];
      return cards.map((el) => {
        const blurb = el.querySelector(".lab-scenario-blurb") as HTMLElement | null;
        return {
          title: el.querySelector(".lab-scenario-title")?.textContent ?? "",
          cardClips: el.scrollHeight > el.clientHeight + 1,
          blurbClips: blurb ? blurb.scrollHeight > blurb.clientHeight + 1 : true,
          blurb: blurb?.textContent?.trim() ?? "",
        };
      });
    });
    expect(report.length, "minigame cards").toBeGreaterThanOrEqual(5);
    for (const row of report) {
      expect(row.cardClips, `${row.title} card clips its copy`).toBe(false);
      expect(row.blurbClips, `${row.title} blurb clips`).toBe(false);
      expect(row.blurb.length, `${row.title} has a blurb`).toBeGreaterThan(12);
    }

    const last = page.locator("#lab-group-items-minigame .lab-scenario").last();
    await last.scrollIntoViewIfNeeded();
    const box = await boxOf(page, "#lab-group-items-minigame .lab-scenario:last-child");
    expect(box.onControl, "last minigame card is tappable").toBe(true);
  });
});

test.describe("phone Lab egg-bot-evolution #203", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("5×8 grid; cells ≥40px; Close returns Roll", async ({ page }) => {
    await launch(page);
    const roll = await centerOf(page, "#btn-roll");
    await page.locator("#btn-lab").click();
    await expect(page.locator("#lab-root")).not.toHaveClass(/hidden/);
    await page.locator('.lab-group-toggle[aria-controls="lab-group-items-minigame"]').click();
    await page.locator('.lab-scenario[data-scenario="egg-bot-evolution"]').click();
    await expect(page.locator("#botevo-root")).not.toHaveClass(/hidden/);
    await expect(page.locator("#botevo-intro")).not.toHaveClass(/hidden/);
    const begin = await boxOf(page, "#botevo-begin");
    expect(begin.height, "Begin ≥44px tall").toBeGreaterThanOrEqual(44);
    expect(begin.onControl, "elementFromPoint Begin").toBe(true);
    await page.locator("#botevo-begin").click();
    await expect(page.locator("#botevo-table")).not.toHaveClass(/hidden/);

    const cells = page.locator("#botevo-grid .botevo-cell");
    await expect(cells).toHaveCount(40);
    const first = await boxOf(page, "#botevo-grid .botevo-cell");
    expect(first.width, "egg cell ≥40px").toBeGreaterThanOrEqual(40);
    expect(first.height, "egg cell ≥40px").toBeGreaterThanOrEqual(40);
    expect(first.onControl, "elementFromPoint egg cell").toBe(true);
    const drop = await boxOf(page, "#botevo-drop");
    expect(drop.width, "Drop ≥44px wide").toBeGreaterThanOrEqual(44);
    expect(drop.height, "Drop ≥44px tall").toBeGreaterThanOrEqual(44);
    expect(drop.onControl, "elementFromPoint Drop").toBe(true);
    const pause = await boxOf(page, "#botevo-pause");
    expect(pause.width, "Pause ≥44px wide").toBeGreaterThanOrEqual(44);
    expect(pause.height, "Pause ≥44px tall").toBeGreaterThanOrEqual(44);
    expect(pause.onControl, "elementFromPoint Pause").toBe(true);

    await page.locator("#botevo-root .handbook-close").click();
    await expect(page.locator("#botevo-root")).toHaveClass(/hidden/);
    await page.locator("#lab-root .handbook-close").click();
    const rollAfter = await hitAt(page, roll.x, roll.y);
    expect(rollAfter?.id, "Roll tappable after Lab close").toBe("btn-roll");
  });
});

test.describe("phone Lab Backup fuel #201", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("6×6 grid; cells ≥44px; Close returns Roll", async ({ page }) => {
    await launch(page);
    const roll = await centerOf(page, "#btn-roll");
    await page.locator("#btn-lab").click();
    await expect(page.locator("#lab-root")).not.toHaveClass(/hidden/);
    await page.locator('.lab-group-toggle[aria-controls="lab-group-items-minigame"]').click();
    await page.locator('.lab-scenario[data-scenario="backup-fuel-pipes"]').click();
    await expect(page.locator("#pipes-root")).not.toHaveClass(/hidden/);

    const cells = page.locator("#pipes-grid .pipe-cell");
    await expect(cells).toHaveCount(36);
    const first = await boxOf(page, "#pipes-grid .pipe-cell");
    expect(first.width, "pipe cell ≥44px").toBeGreaterThanOrEqual(44);
    expect(first.height, "pipe cell ≥44px").toBeGreaterThanOrEqual(44);
    expect(first.onControl, "elementFromPoint pipe cell").toBe(true);

    await page.locator("#pipes-root .handbook-close").click();
    await expect(page.locator("#pipes-root")).toHaveClass(/hidden/);
    await page.locator("#lab-root .handbook-close").click();
    const rollAfter = await hitAt(page, roll.x, roll.y);
    expect(rollAfter?.id, "Roll tappable after Lab close").toBe("btn-roll");
  });
});

const HUMAN_DUEL = {
  high: '#duel-side-right [data-stance="high"]',
  low: '#duel-side-right [data-stance="low"]',
  roll: "#duel-side-right [data-roll]",
} as const;

async function openDuelPlay(page: Page) {
  await page.evaluate(() => {
    const root = document.getElementById("duel-root");
    if (!root) return;
    root.classList.remove("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("handbook-open");
    const matchup = document.getElementById("duel-matchup");
    if (matchup) matchup.textContent = "The Ada vs You · belt 2";
    const status = document.getElementById("duel-status");
    if (status) {
      status.textContent = [
        "Mean of game 2d6 totals: 7.00",
        "Stances hidden until both have rolled",
        "Choose High or Low on your side",
      ].join("\n");
    }
    const left = document.getElementById("dice-label-l");
    const right = document.getElementById("dice-label-r");
    if (left) left.textContent = "The Ada";
    if (right) right.textContent = "You";
    document.getElementById("duel-actions-left")?.classList.remove("hidden");
    document.getElementById("duel-actions-right")?.classList.remove("hidden");
    document.getElementById("duel-result-footer")?.classList.add("hidden");
  });
  await expect(page.locator("#duel-root")).not.toHaveClass(/hidden/);
}

async function openDuelResult(page: Page) {
  await page.evaluate(() => {
    const root = document.getElementById("duel-root");
    if (!root) return;
    root.classList.remove("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("handbook-open");
    const matchup = document.getElementById("duel-matchup");
    if (matchup) matchup.textContent = "The Ada vs You · belt 2";
    const left = document.getElementById("dice-label-l");
    const right = document.getElementById("dice-label-r");
    if (left) left.textContent = "The Ada";
    if (right) right.textContent = "You";
    document.getElementById("duel-actions-left")?.classList.add("hidden");
    document.getElementById("duel-actions-right")?.classList.add("hidden");
    const footer = document.getElementById("duel-result-footer");
    footer?.classList.remove("hidden");
    const headline = document.getElementById("duel-result-headline");
    if (headline) headline.textContent = "You win!";
    const punchy = document.getElementById("duel-result-punchy");
    if (punchy) punchy.textContent = "The lane is yours.";
    const summary = document.getElementById("duel-result-summary");
    if (summary) {
      summary.textContent = [
        "The Ada [HIGH] 9 · You [LOW] 11",
        "You hold the blank. Ada skips next seat.",
      ].join("\n");
    }
  });
  await expect(page.locator("#duel-root")).not.toHaveClass(/hidden/);
  await expect(page.locator("#duel-result-footer")).not.toHaveClass(/hidden/);
}

function assertOnScreen(
  b: { top: number; height: number },
  sel: string,
  h: number,
) {
  expect(b.height, `${sel} ≥56px`).toBeGreaterThanOrEqual(56);
  expect(b.top, `${sel} on screen`).toBeGreaterThanOrEqual(0);
  expect(b.top + b.height, `${sel} in first sheet`).toBeLessThanOrEqual(h + 2);
}

test.describe("phone Gravity Duel #179", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("human High / Low / Roll are on-screen and receive the tap", async ({
    page,
  }) => {
    await launch(page);
    const rollThumb = await centerOf(page, "#btn-roll");

    await openDuelPlay(page);

    const root = await boxOf(page, "#duel-root");
    expect(Number(root.zIndex), "duel sheet z-index").toBeGreaterThanOrEqual(
      2000,
    );

    for (const sel of [HUMAN_DUEL.high, HUMAN_DUEL.low, HUMAN_DUEL.roll]) {
      const b = await boxOf(page, sel);
      assertOnScreen(b, sel, PHONE.h);
      expect(b.pointerEvents).not.toBe("none");
      expect(b.onControl, `elementFromPoint ${sel}`).toBe(true);
    }

    const overRoll = await hitAt(page, rollThumb.x, rollThumb.y);
    expect(overRoll?.id, "thumbs must not win while duel is open").not.toBe(
      "btn-roll",
    );
    expect(overRoll?.id, "Book must not win while duel is open").not.toBe(
      "btn-handbook-header",
    );
    expect(overRoll?.id, "End must not win while duel is open").not.toBe(
      "btn-end",
    );

    const opp = await cssOf(page, "#duel-side-left .dice-label");
    expect(opp.display, "opponent name stays").not.toBe("none");
    const oppDice = await cssOf(page, "#die-l1");
    expect(oppDice.display, "opponent dice stay").not.toBe("none");
  });

  test("spot-check 360 and 430: High / Low / Roll stay in the first sheet", async ({
    page,
  }) => {
    await launch(page);

    for (const size of [
      { w: 360, h: 800 },
      { w: 430, h: 932 },
    ]) {
      await page.setViewportSize({ width: size.w, height: size.h });
      await openDuelPlay(page);
      for (const sel of [HUMAN_DUEL.high, HUMAN_DUEL.low, HUMAN_DUEL.roll]) {
        const b = await boxOf(page, sel);
        expect(b.height, `${size.w} ${sel} ≥44px`).toBeGreaterThanOrEqual(44);
        expect(b.top + b.height, `${size.w} ${sel} in view`).toBeLessThanOrEqual(
          size.h + 2,
        );
        expect(b.onControl, `${size.w} ${sel} tappable`).toBe(true);
      }
      await page.evaluate(() => {
        document.getElementById("duel-root")?.classList.add("hidden");
        document.body.classList.remove("handbook-open");
      });
    }
  });

  test("Continue is in view; close returns Roll · Book · End", async ({
    page,
  }) => {
    await launch(page);
    await openDuelResult(page);

    const ok = await boxOf(page, "#duel-result-ok");
    assertOnScreen(ok, "#duel-result-ok", PHONE.h);
    expect(ok.onControl, "elementFromPoint Continue").toBe(true);
    expect(ok.center?.id).toBe("duel-result-ok");

    await page.locator("#duel-result-ok").click();
    await expect(page.locator("#duel-root")).toHaveClass(/hidden/);

    for (const sel of ["#btn-roll", "#btn-handbook-header", "#btn-end"]) {
      const b = await boxOf(page, sel);
      expect(b.height, `${sel} thumb after Continue`).toBeGreaterThanOrEqual(44);
      expect(b.top + b.height).toBeLessThanOrEqual(PHONE.h + 2);
      expect(b.onControl, `${sel} tappable after Continue`).toBe(true);
    }

    const roll = await centerOf(page, "#btn-roll");
    const overRoll = await hitAt(page, roll.x, roll.y);
    expect(overRoll?.id, "hidden duel does not steal Roll").toBe("btn-roll");
  });
});

async function openUrpFromLab(page: Page) {
  await bootSetup(page);
  await page.locator("#btn-lab").click();
  await expect(page.locator("#lab-root")).not.toHaveClass(/hidden/);
  await page
    .locator('.lab-group-toggle[aria-controls="lab-group-items-minigame"]')
    .click();
  await page.locator('.lab-scenario[data-scenario="urinal-rule-parking"]').click();
  await expect(page.locator("#urp-root")).not.toHaveClass(/hidden/);
}

test.describe("urinal-rule-parking pads #225", () => {
  test("landscape / wide: field has height; pads ≥44px; hatch left", async ({
    page,
    viewport,
  }) => {
    test.skip((viewport?.width ?? 0) < 1100, "wide only");
    await page.setViewportSize({ width: 1200, height: 800 });
    await openUrpFromLab(page);

    const field = await boxOf(page, ".urp-field");
    expect(field.height, "landscape pad field has height").toBeGreaterThan(8);
    expect(field.width, "landscape pad field has width").toBeGreaterThan(8);

    const pads = page.locator("#urp-pads .urp-pad");
    await expect(pads.first()).toBeVisible();
    const n = await pads.count();
    expect(n, "pads rendered").toBeGreaterThanOrEqual(2);
    for (let i = 0; i < n; i++) {
      const pad = await boxOf(page, `#urp-pads .urp-pad:nth-child(${i + 1})`);
      expect(pad.width, `pad ${i} width`).toBeGreaterThanOrEqual(44);
      expect(pad.height, `pad ${i} height`).toBeGreaterThanOrEqual(44);
    }
    const empty = await boxOf(page, "#urp-pads .urp-pad.is-empty");
    expect(empty.onControl, "empty pad tappable").toBe(true);

    const hatch = await boxOf(page, "#urp-root .urp-hatch");
    expect(hatch.x, "hatch left of pads").toBeLessThan(field.x);
  });

  test("phone portrait: pads still ≥44px; hatch below field", async ({
    page,
    viewport,
  }) => {
    test.skip((viewport?.width ?? 0) >= 900, "phone only");
    await openUrpFromLab(page);

    const field = await boxOf(page, ".urp-field");
    expect(field.height, "portrait pad field has height").toBeGreaterThan(8);

    const pads = page.locator("#urp-pads .urp-pad");
    await expect(pads.first()).toBeVisible();
    const empty = await boxOf(page, "#urp-pads .urp-pad.is-empty");
    expect(empty.width).toBeGreaterThanOrEqual(44);
    expect(empty.height).toBeGreaterThanOrEqual(44);
    expect(empty.onControl, "portrait empty pad tappable").toBe(true);

    const hatch = await boxOf(page, "#urp-root .urp-hatch");
    expect(hatch.top, "hatch below pads").toBeGreaterThan(field.top);
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

test.describe("wide Gravity Duel #179", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1100, "wide only");

  test("desktop duel still has High / Low / Roll", async ({ page }) => {
    await launch(page);
    await openDuelPlay(page);
    for (const sel of [HUMAN_DUEL.high, HUMAN_DUEL.low, HUMAN_DUEL.roll]) {
      const b = await boxOf(page, sel);
      expect(b.display, `${sel} visible on wide`).not.toBe("none");
      expect(b.height, `${sel} tappable on wide`).toBeGreaterThanOrEqual(36);
      expect(b.onControl, `${sel} elementFromPoint on wide`).toBe(true);
    }
  });
});

async function openAuction(page: Page) {
  await page.evaluate(() => {
    const root = document.getElementById("auction-root");
    if (!root) return;
    root.classList.remove("hidden");
    const title = document.getElementById("auction-title");
    if (title) title.textContent = "Phobos";
    const body = document.getElementById("auction-body");
    if (body) {
      body.textContent =
        "The Ada is auctioning Phobos. Reserve ⍺120. You have ⍺1000.";
    }
    const amount = document.getElementById(
      "auction-amount",
    ) as HTMLInputElement | null;
    if (amount) {
      amount.min = "120";
      amount.value = "120";
    }
  });
  await expect(page.locator("#auction-root")).not.toHaveClass(/hidden/);
}

async function closeAuction(page: Page) {
  await page.evaluate(() => {
    document.getElementById("auction-root")?.classList.add("hidden");
  });
  await expect(page.locator("#auction-root")).toHaveClass(/hidden/);
}

test.describe("phone Claim auction #183", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("Bid and Pass are on-screen and receive the tap", async ({ page }) => {
    await launch(page);
    const rollThumb = await centerOf(page, "#btn-roll");

    await openAuction(page);

    const root = await boxOf(page, "#auction-root");
    expect(Number(root.zIndex), "auction sheet z-index").toBeGreaterThanOrEqual(
      2000,
    );
    expect(root.width, "full-bleed width").toBeGreaterThanOrEqual(PHONE.w - 1);
    expect(root.height, "full-bleed height").toBeGreaterThanOrEqual(PHONE.h - 2);

    for (const sel of ["#auction-pass", "#auction-bid"]) {
      const b = await boxOf(page, sel);
      assertOnScreen(b, sel, PHONE.h);
      expect(b.pointerEvents).not.toBe("none");
      expect(b.onControl, `elementFromPoint ${sel}`).toBe(true);
    }

    const pass = await boxOf(page, "#auction-pass");
    expect(pass.center?.id, "Pass hit is the button").toBe("auction-pass");
    const bid = await boxOf(page, "#auction-bid");
    expect(bid.center?.id, "Bid hit is the button").toBe("auction-bid");

    const overRoll = await hitAt(page, rollThumb.x, rollThumb.y);
    expect(overRoll?.id, "thumbs must not win while auction is open").not.toBe(
      "btn-roll",
    );
    expect(overRoll?.id, "Book must not win while auction is open").not.toBe(
      "btn-handbook-header",
    );
    expect(overRoll?.id, "End must not win while auction is open").not.toBe(
      "btn-end",
    );

    const copy = await page.evaluate(() => {
      const title = document.getElementById("auction-title");
      const body = document.getElementById("auction-body");
      const cs = (el: HTMLElement | null) => (el ? getComputedStyle(el) : null);
      const titleCs = cs(title);
      const bodyCs = cs(body);
      return {
        title: title?.textContent ?? "",
        body: body?.textContent ?? "",
        titleOverflow: titleCs?.textOverflow,
        titleWhiteSpace: titleCs?.whiteSpace,
        bodyOverflow: bodyCs?.textOverflow,
        bodyWhiteSpace: bodyCs?.whiteSpace,
      };
    });
    expect(copy.title).toContain("Phobos");
    expect(copy.body).toContain("⍺120");
    expect(copy.body).toContain("The Ada");
    expect(copy.bodyOverflow, "reserve number is not ellipsized").not.toBe(
      "ellipsis",
    );
    expect(copy.titleOverflow, "claim name is not ellipsized").not.toBe(
      "ellipsis",
    );
    expect(copy.bodyWhiteSpace).not.toBe("nowrap");
  });

  test("close returns Roll · Book · End; hidden auction does not steal taps", async ({
    page,
  }) => {
    await launch(page);
    await openAuction(page);
    await closeAuction(page);

    for (const sel of ["#btn-roll", "#btn-handbook-header", "#btn-end"]) {
      const b = await boxOf(page, sel);
      expect(b.height, `${sel} thumb after auction`).toBeGreaterThanOrEqual(44);
      expect(b.top + b.height).toBeLessThanOrEqual(PHONE.h + 2);
      expect(b.onControl, `${sel} tappable after auction`).toBe(true);
    }

    const roll = await centerOf(page, "#btn-roll");
    const overRoll = await hitAt(page, roll.x, roll.y);
    expect(overRoll?.id, "hidden auction does not steal Roll").toBe("btn-roll");

    const hidden = await cssOf(page, "#auction-root");
    expect(
      hidden.pointerEvents === "none" || hidden.display === "none",
      "#auction-root must not steal taps when hidden",
    ).toBe(true);
  });
});

test.describe("wide Claim auction #183", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1100, "wide only");

  test("desktop auction still has Bid / Pass", async ({ page }) => {
    await launch(page);
    await openAuction(page);
    for (const sel of ["#auction-pass", "#auction-bid"]) {
      const b = await boxOf(page, sel);
      expect(b.display, `${sel} visible on wide`).not.toBe("none");
      expect(b.height, `${sel} tappable on wide`).toBeGreaterThanOrEqual(36);
      expect(b.onControl, `${sel} elementFromPoint on wide`).toBe(true);
    }
  });
});

async function openEndScreen(page: Page) {
  await page.evaluate(() => {
    const root = document.getElementById("end-root");
    if (!root) return;
    root.classList.remove("hidden");
    root.setAttribute("aria-hidden", "false");
    const kicker = root.querySelector(".end-kicker");
    if (kicker) kicker.textContent = "Greatest of all kind";
    const title = document.getElementById("end-title");
    if (title) title.textContent = "The Ada Prevails";
    const story = document.getElementById("end-story");
    if (story) {
      story.textContent = [
        "The Ada is the last pilot flying.",
        "The ledger writes The Ada as one of the greatest of all kind.",
        "The ledger ran 8 rounds.",
        "Closing books: ⍺2100 net worth · 3 claims · 1 depot.",
        "Best books: Enceladus 236% · Venus 180% · Elon 91%.",
      ].join(" ");
    }
    const ranks = document.getElementById("end-ranks");
    if (ranks) {
      ranks.innerHTML = [
        "<div>1. The Ada ★ — ⍺2100 · flying</div>",
        "<div>2. The Recorde — out round 6 · lab elimination</div>",
        "<div>3. The K-127 — out round 4 · lab elimination</div>",
        "<div>4. The Turing — out round 2 · lab elimination</div>",
        "<div>5. The Sagan — out round 2 · lab elimination</div>",
        "<div>6. The Asimov — out round 1 · lab elimination</div>",
      ].join("");
    }
  });
  await expect(page.locator("#end-root")).not.toHaveClass(/hidden/);
}

test.describe("phone end screen #178", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 900, "phone only");

  test("winner and Rematch are on-screen; ROI% is not the hero", async ({
    page,
  }) => {
    await launch(page);
    const rollThumb = await centerOf(page, "#btn-roll");

    await openEndScreen(page);

    const root = await boxOf(page, "#end-root");
    expect(Number(root.zIndex), "end sheet z-index").toBeGreaterThanOrEqual(
      2000,
    );
    expect(root.width, "full-bleed width").toBeGreaterThanOrEqual(PHONE.w - 1);
    expect(root.height, "full-bleed height").toBeGreaterThanOrEqual(PHONE.h - 2);

    const title = await boxOf(page, "#end-title");
    expect(title.top, "winner on screen").toBeGreaterThanOrEqual(0);
    expect(title.top + title.height).toBeLessThanOrEqual(PHONE.h + 2);
    const titleText = await page.locator("#end-title").innerText();
    expect(titleText).toContain("The Ada");
    expect(titleText).toContain("Prevails");
    expect(titleText, "ROI% is not the headline").not.toMatch(/%/);

    const ranksText = await page.locator("#end-ranks").innerText();
    expect(ranksText).toContain("The Ada");
    expect(ranksText).toContain("⍺2100");
    expect(ranksText, "ranks are mark/income books, not ROI%").not.toMatch(/%/);

    const type = await page.evaluate(() => {
      const titleEl = document.getElementById("end-title");
      const storyEl = document.getElementById("end-story");
      const titlePx = titleEl
        ? Number.parseFloat(getComputedStyle(titleEl).fontSize)
        : 0;
      const storyPx = storyEl
        ? Number.parseFloat(getComputedStyle(storyEl).fontSize)
        : 0;
      return { titlePx, storyPx };
    });
    expect(type.titlePx, "winner is the hero type").toBeGreaterThan(18);
    expect(type.titlePx, "story/ROI is not the hero type").toBeGreaterThan(
      type.storyPx,
    );

    const again = await boxOf(page, "#end-again");
    assertOnScreen(again, "#end-again", PHONE.h);
    expect(again.onControl, "elementFromPoint Rematch").toBe(true);
    expect(again.center?.id).toBe("end-again");
    expect((await page.locator("#end-again").innerText()).trim()).toBe(
      "Rematch",
    );

    const close = await boxOf(page, "#end-close");
    expect(close.height, "#end-close ≥44px").toBeGreaterThanOrEqual(44);
    expect(close.top + close.height, "#end-close in view").toBeLessThanOrEqual(
      PHONE.h + 2,
    );
    expect(close.onControl, "elementFromPoint New Game").toBe(true);
    expect((await page.locator("#end-close").innerText()).trim()).toBe(
      "New Game",
    );

    const overRoll = await hitAt(page, rollThumb.x, rollThumb.y);
    expect(overRoll?.id, "thumbs must not win while end is open").not.toBe(
      "btn-roll",
    );
    expect(overRoll?.id, "Book must not win while end is open").not.toBe(
      "btn-handbook-header",
    );
    expect(overRoll?.id, "End must not win while end is open").not.toBe(
      "btn-end",
    );
  });

  test("Rematch rematches; New Game goes to Launch to change Pilots", async ({
    page,
  }) => {
    await launch(page);
    await openEndScreen(page);
    await page.locator("#end-again").click();
    await expect(page.locator("#end-root")).toHaveClass(/hidden/);
    await expect(page.locator("#fleet-card")).toHaveClass(/mode-standings/);

    for (const sel of ["#btn-roll", "#btn-handbook-header", "#btn-end"]) {
      const b = await boxOf(page, sel);
      expect(b.height, `${sel} after Rematch`).toBeGreaterThanOrEqual(44);
      expect(b.top + b.height).toBeLessThanOrEqual(PHONE.h + 2);
      expect(b.onControl, `${sel} tappable after Rematch`).toBe(true);
    }

    await openEndScreen(page);
    await page.locator("#end-close").click();
    await expect(page.locator("#end-root")).toHaveClass(/hidden/);
    await expect(page.locator("#fleet-card")).toHaveClass(/mode-setup/);

    const launchBtn = await boxOf(page, "#btn-new");
    expect(launchBtn.height, "Launch ≥56px").toBeGreaterThanOrEqual(56);
    expect(launchBtn.top + launchBtn.height).toBeLessThanOrEqual(PHONE.h + 1);
    expect(launchBtn.onControl, "elementFromPoint Launch").toBe(true);
    expect(launchBtn.center?.id).toBe("btn-new");

    const six = await boxOf(page, '#pilot-count-chips [data-players="6"]');
    expect(six.height, "Pilots chip ≥44px").toBeGreaterThanOrEqual(44);
    expect(six.top + six.height).toBeLessThanOrEqual(PHONE.h + 1);
    expect(six.onControl, "New Game can pick a bigger roster").toBe(true);

    const hidden = await cssOf(page, "#end-root");
    expect(
      hidden.pointerEvents === "none" || hidden.display === "none",
      "#end-root must not steal taps when hidden",
    ).toBe(true);
  });
});

test.describe("wide end screen #178", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1100, "wide only");

  test("desktop end still has winner + Rematch", async ({ page }) => {
    await launch(page);
    await openEndScreen(page);
    const title = await page.locator("#end-title").innerText();
    expect(title).toContain("The Ada");
    const again = await boxOf(page, "#end-again");
    expect(again.display, "#end-again visible on wide").not.toBe("none");
    expect(again.height, "#end-again tappable on wide").toBeGreaterThanOrEqual(
      36,
    );
    expect(again.onControl, "#end-again elementFromPoint on wide").toBe(true);
  });
});

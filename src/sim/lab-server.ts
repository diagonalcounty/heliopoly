/**
 * Local Sim Lab — web UI to run batch scenarios (#91).
 *
 *   npm run sim-lab
 *   open http://127.0.0.1:5174/
 *
 * Localhost only. Not part of heliopoly.live static deploy.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeAiDifficulty, type AiDifficulty } from "../core/types";
import { runBatch, makeRunId } from "./batch";
import type { SimExperiment } from "./types";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const LAB_STATIC = join(__dirname, "lab-static");
const REPO_ROOT = resolve(__dirname, "../..");
const HOST = process.env.HELIOPOLY_SIM_LAB_HOST ?? "127.0.0.1";
const PORT = Number(process.env.HELIOPOLY_SIM_LAB_PORT ?? 5174);

const EXPERIMENTS: SimExperiment[] = [
  "default",
  "prograde",
  "retrograde",
  "choice",
  "mixed",
];

/** One batch at a time so RAM/CPU stay predictable. */
let busy = false;

function silenceDebug(): void {
  if (typeof console !== "undefined" && console.debug) {
    console.debug = () => {};
  }
}

function send(
  res: ServerResponse,
  status: number,
  body: string | Buffer,
  type: string,
): void {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function mime(path: string): string {
  switch (extname(path)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function serveStatic(res: ServerResponse, urlPath: string): void {
  let rel = urlPath === "/" ? "/index.html" : urlPath;
  rel = rel.replace(/\?.*$/, "");
  if (rel.includes("..")) {
    send(res, 400, "bad path", "text/plain");
    return;
  }
  const file = join(LAB_STATIC, rel);
  if (!existsSync(file)) {
    send(res, 404, "not found", "text/plain");
    return;
  }
  send(res, 200, readFileSync(file), mime(file));
}

interface RunBody {
  games?: number;
  players?: number;
  experiment?: string;
  difficulty?: string;
  seed?: number;
  seedStride?: number;
  maxTurns?: number;
  save?: boolean;
}

function parseRun(body: RunBody): {
  games: number;
  players: number;
  experiment: SimExperiment;
  aiDifficulty: AiDifficulty;
  baseSeed: number;
  seedStride: number;
  maxTurns: number;
  save: boolean;
} {
  const experiment = (body.experiment ?? "default") as SimExperiment;
  if (!EXPERIMENTS.includes(experiment)) {
    throw new Error(`Unknown experiment: ${body.experiment}`);
  }
  const games = Math.min(50_000, Math.max(1, Math.floor(Number(body.games) || 100)));
  const players = Math.min(6, Math.max(2, Math.floor(Number(body.players) || 4)));
  return {
    games,
    players,
    experiment,
    aiDifficulty: normalizeAiDifficulty(body.difficulty ?? "normal"),
    baseSeed: (Number(body.seed) || 1000) >>> 0,
    seedStride: Math.max(1, Math.floor(Number(body.seedStride) || 997)),
    maxTurns: Math.max(100, Math.floor(Number(body.maxTurns) || 3000)),
    save: Boolean(body.save),
  };
}

async function handleApiRun(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    send(res, 405, "POST only", "text/plain");
    return;
  }
  if (busy) {
    send(
      res,
      409,
      JSON.stringify({ error: "A run is already in progress. Wait for it to finish." }),
      "application/json",
    );
    return;
  }

  let raw: string;
  try {
    raw = await readBody(req);
  } catch {
    send(res, 400, JSON.stringify({ error: "bad body" }), "application/json");
    return;
  }

  let body: RunBody;
  try {
    body = JSON.parse(raw || "{}") as RunBody;
  } catch {
    send(res, 400, JSON.stringify({ error: "invalid JSON" }), "application/json");
    return;
  }

  let opts: ReturnType<typeof parseRun>;
  try {
    opts = parseRun(body);
  } catch (e) {
    send(
      res,
      400,
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      "application/json",
    );
    return;
  }

  busy = true;
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-store",
    Connection: "keep-alive",
  });

  const sendEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent("start", {
    games: opts.games,
    experiment: opts.experiment,
    difficulty: opts.aiDifficulty,
    players: opts.players,
    seed: opts.baseSeed,
  });

  try {
    const runId = makeRunId();
    const saveDir = opts.save
      ? join(REPO_ROOT, "sim-results", `${runId}-${opts.experiment}`)
      : undefined;

    const { summary, sampleGames, outDir } = runBatch({
      games: opts.games,
      players: opts.players,
      baseSeed: opts.baseSeed,
      seedStride: opts.seedStride,
      maxTurns: opts.maxTurns,
      experiment: opts.experiment,
      aiDifficulty: opts.aiDifficulty,
      saveDir,
      runId,
      cliArgs: ["sim-lab", JSON.stringify(opts)],
      sampleLimit: 40,
      onProgress: (p) => {
        sendEvent("progress", p);
      },
    });

    sendEvent("done", {
      summary,
      sampleGames,
      outDir: outDir ?? null,
    });
  } catch (e) {
    sendEvent("error", {
      message: e instanceof Error ? e.message : String(e),
    });
  } finally {
    busy = false;
    res.end();
  }
}

async function handle(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const url = req.url ?? "/";
  if (url.startsWith("/api/run")) {
    await handleApiRun(req, res);
    return;
  }
  if (url.startsWith("/api/health")) {
    send(
      res,
      200,
      JSON.stringify({ ok: true, busy, host: HOST, port: PORT }),
      "application/json",
    );
    return;
  }
  serveStatic(res, url.split("?")[0] ?? "/");
}

silenceDebug();

const server = createServer((req, res) => {
  void handle(req, res).catch((err) => {
    console.error(err);
    if (!res.headersSent) {
      send(res, 500, "server error", "text/plain");
    } else {
      res.end();
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Heliopoly Sim Lab  http://${HOST}:${PORT}/`);
  console.log(`  engine: live TypeScript core · one run at a time`);
  console.log(`  stop: Ctrl+C`);
});

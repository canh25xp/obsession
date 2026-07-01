import { promises as fs } from "fs";
import path from "path";

// ── Types ───────────────────────────────────────────────────────────

export type EventType =
  | "page_view"
  | "no_hover"
  | "no_click"
  | "yes_click"
  | "mouse_move";

export interface TrackingEvent {
  id: string;
  type: EventType;
  timestamp: string; // ISO string
  sessionId: string;
  attemptNumber?: number;
  position?: { x: number; y: number };
  metadata?: Record<string, unknown>;
}

/** What the client sends — server adds `id` and `timestamp`. */
export type EventInput = Omit<TrackingEvent, "id" | "timestamp">;

// ── Storage paths ────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "tracking-events.json");

// ── Concurrency lock ────────────────────────────────────────────────
// Serialises read-modify-write cycles so concurrent requests don't
// overwrite each other's data.

let writeLock: Promise<void> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = writeLock.then(fn);
  // Keep the chain alive even if fn rejects
  writeLock = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

// ── Low-level file helpers ───────────────────────────────────────────

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readEvents(): Promise<TrackingEvent[]> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(content) as TrackingEvent[];
  } catch {
    // File doesn't exist yet or is corrupted — start fresh
    return [];
  }
}

async function writeEvents(events: TrackingEvent[]): Promise<void> {
  await ensureDataDir();
  // Atomic write: write to temp file then rename
  const tempFile = DATA_FILE + ".tmp";
  await fs.writeFile(tempFile, JSON.stringify(events, null, 2), "utf-8");
  await fs.rename(tempFile, DATA_FILE);
}

// ── Public API ───────────────────────────────────────────────────────

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function recordEvent(
  input: EventInput,
): Promise<TrackingEvent> {
  return withLock(async () => {
    const event: TrackingEvent = {
      ...input,
      id: makeId(),
      timestamp: new Date().toISOString(),
    };
    const events = await readEvents();
    events.push(event);
    await writeEvents(events);
    return event;
  });
}

export async function recordEvents(
  inputs: EventInput[],
): Promise<TrackingEvent[]> {
  return withLock(async () => {
    const now = new Date().toISOString();
    const newEvents: TrackingEvent[] = inputs.map((input, i) => ({
      ...input,
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: now,
    }));
    const events = await readEvents();
    events.push(...newEvents);
    await writeEvents(events);
    return newEvents;
  });
}

export async function getAllEvents(): Promise<TrackingEvent[]> {
  return readEvents();
}

export interface TrackingStats {
  totalEvents: number;
  sessions: number;
  pageViews: number;
  noHoverCount: number;
  noClickCount: number;
  yesClickCount: number;
  mouseMoveCount: number;
  yesClicks: Array<{
    timestamp: string;
    sessionId: string;
    attemptNumber?: number;
  }>;
  recentEvents: TrackingEvent[];
}

export async function getStats(): Promise<TrackingStats> {
  const events = await readEvents();

  const noHovers = events.filter((e) => e.type === "no_hover");
  const noClicks = events.filter((e) => e.type === "no_click");
  const yesClicks = events.filter((e) => e.type === "yes_click");
  const pageViews = events.filter((e) => e.type === "page_view");
  const mouseMoves = events.filter((e) => e.type === "mouse_move");

  const sessionSet = new Set(events.map((e) => e.sessionId));

  return {
    totalEvents: events.length,
    sessions: sessionSet.size,
    pageViews: pageViews.length,
    noHoverCount: noHovers.length,
    noClickCount: noClicks.length,
    yesClickCount: yesClicks.length,
    mouseMoveCount: mouseMoves.length,
    yesClicks: yesClicks.map((e) => ({
      timestamp: e.timestamp,
      sessionId: e.sessionId,
      attemptNumber: e.attemptNumber,
    })),
    recentEvents: events.slice(-50).reverse(),
  };
}

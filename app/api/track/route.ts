import {
  recordEvent,
  recordEvents,
  getStats,
  type EventInput,
  type EventType,
} from "@/lib/tracking";

const VALID_TYPES: EventType[] = [
  "page_view",
  "no_hover",
  "no_click",
  "yes_click",
  "mouse_move",
];

function isValidType(type: unknown): type is EventType {
  return typeof type === "string" && VALID_TYPES.includes(type as EventType);
}

// ── POST /api/track ──────────────────────────────────────────────────
// Accepts either a single event object or a batch `{ events: [...] }`.

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Batch mode: { events: [...] }
    if (Array.isArray(body.events)) {
      const inputs: EventInput[] = body.events
        .filter(
          (e: Record<string, unknown>) =>
            isValidType(e.type) && typeof e.sessionId === "string",
        )
        .map((e: Record<string, unknown>) => e as unknown as EventInput);

      if (inputs.length === 0) {
        return Response.json(
          { success: false, error: "No valid events" },
          { status: 400 },
        );
      }

      const recorded = await recordEvents(inputs);
      return Response.json({ success: true, count: recorded.length });
    }

    // Single event mode
    if (!isValidType(body.type) || typeof body.sessionId !== "string") {
      return Response.json(
        { success: false, error: "Invalid event payload" },
        { status: 400 },
      );
    }

    const recorded = await recordEvent(body as EventInput);
    return Response.json({ success: true, event: recorded });
  } catch {
    return Response.json(
      { success: false, error: "Failed to record event" },
      { status: 500 },
    );
  }
}

// ── GET /api/track ───────────────────────────────────────────────────
// Returns aggregated stats and recent events.

export async function GET() {
  try {
    const stats = await getStats();
    return Response.json(stats);
  } catch {
    return Response.json(
      { success: false, error: "Failed to get stats" },
      { status: 500 },
    );
  }
}

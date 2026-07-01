"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Types ───────────────────────────────────────────────────────────

type EventType =
  | "page_view"
  | "no_hover"
  | "no_click"
  | "yes_click"
  | "mouse_move";

interface TrackEventInput {
  type: EventType;
  attemptNumber?: number;
  position?: { x: number; y: number };
  metadata?: Record<string, unknown>;
}

// ── Hook ────────────────────────────────────────────────────────────

/**
 * useTracking — client-side hook that records mouse movement and button
 * interactions, sending them to `/api/track` for server-side persistence.
 *
 * Discrete events (page_view, no_hover, no_click, yes_click) are sent
 * immediately via `fetch`.  Mouse-move events are throttled, buffered,
 * and flushed every 3 s (or on page unload via `sendBeacon`).
 */
export function useTracking() {
  const sessionIdRef = useRef<string>("");
  const mouseMoveBufferRef = useRef<TrackEventInput[]>([]);

  // Generate a unique session ID once on mount
  useEffect(() => {
    sessionIdRef.current =
      `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }, []);

  // ── Send helpers ──────────────────────────────────────────────────

  const flushMouseMoves = useCallback((useBeacon = false) => {
    const buffer = mouseMoveBufferRef.current;
    if (buffer.length === 0) return;

    mouseMoveBufferRef.current = [];
    const events = buffer.map((e) => ({
      ...e,
      sessionId: sessionIdRef.current,
    }));

    if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events })], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/track", blob);
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  const trackEvent = useCallback(
    (input: TrackEventInput) => {
      const payload = {
        ...input,
        sessionId: sessionIdRef.current,
      };

      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    },
    [],
  );

  // ── Mouse-move tracking + page view ───────────────────────────────

  useEffect(() => {
    // Track page view on mount
    trackEvent({ type: "page_view" });

    // Throttle config
    const THROTTLE_MS = 500;
    const MIN_DISTANCE = 20; // px
    let lastMoveTime = 0;
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (now - lastMoveTime < THROTTLE_MS || distance < MIN_DISTANCE) return;

      lastMoveTime = now;
      lastX = e.clientX;
      lastY = e.clientY;

      mouseMoveBufferRef.current.push({
        type: "mouse_move",
        position: { x: e.clientX, y: e.clientY },
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Flush buffered mouse moves every 3 s
    const flushInterval = setInterval(() => {
      flushMouseMoves();
    }, 3000);

    // Flush on page unload
    const handleBeforeUnload = () => {
      flushMouseMoves(true);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(flushInterval);
      flushMouseMoves();
    };
  }, [trackEvent, flushMouseMoves]);

  return { trackEvent };
}

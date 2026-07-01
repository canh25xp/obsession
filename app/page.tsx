"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";

const PINK_PASTEL = { r: 255, g: 182, b: 193 };
const DARK = { r: 25, g: 5, b: 10 };
const MAX_ATTEMPTS = 10;

function getBackgroundColor(attempts: number): string {
  const t = Math.min(attempts / MAX_ATTEMPTS, 1);
  const r = Math.round(PINK_PASTEL.r + t * (DARK.r - PINK_PASTEL.r));
  const g = Math.round(PINK_PASTEL.g + t * (DARK.g - PINK_PASTEL.g));
  const b = Math.round(PINK_PASTEL.b + t * (DARK.b - PINK_PASTEL.b));
  return `rgb(${r}, ${g}, ${b})`;
}

interface MessageDef {
  threshold: number;
  text: string;
  image: string;
  isVideo?: boolean;
}

const MESSAGES: MessageDef[] = [
  { threshold: 3, text: "That's not an option", image: "/message_3.png" },
  { threshold: 5, text: "Please ?", image: "/message_5.gif" },
  { threshold: 8, text: "You really gonna make me beg aren't you ?", image: "/message_8.gif" },
  { threshold: 10, text: "", image: "/message_10.gif", isVideo: true },
];

function getActiveMessage(attempts: number): MessageDef | null {
  const matched = MESSAGES.filter((m) => m.threshold <= attempts);
  return matched.length > 0 ? matched[matched.length - 1] : null;
}

export default function Home() {
  const [noAttempts, setNoAttempts] = useState(0);
  const [yesClicked, setYesClicked] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [hasMoved, setHasMoved] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const handleNoHover = useCallback(() => {
    const newAttempts = noAttempts + 1;
    setNoAttempts(newAttempts);
    setHasMoved(true);

    const buttonWidth = 130;
    const buttonHeight = 56;
    const padding = 20;

    // Collect exclusion zones from existing on-screen elements so the
    // No button never lands on top of the poster, Yes button, or message.
    const exclusionZones: DOMRect[] = [];
    if (posterRef.current) exclusionZones.push(posterRef.current.getBoundingClientRect());
    if (yesButtonRef.current) exclusionZones.push(yesButtonRef.current.getBoundingClientRect());
    if (messageRef.current) exclusionZones.push(messageRef.current.getBoundingClientRect());

    const buffer = 16; // extra spacing around exclusion zones

    const overlaps = (x: number, y: number): boolean => {
      const left = x;
      const top = y;
      const right = x + buttonWidth;
      const bottom = y + buttonHeight;
      return exclusionZones.some(
        (zone) =>
          left < zone.right + buffer &&
          right > zone.left - buffer &&
          top < zone.bottom + buffer &&
          bottom > zone.top - buffer
      );
    };

    const maxX = window.innerWidth - buttonWidth - padding;
    const maxY = window.innerHeight - buttonHeight - padding;

    let chosenX = padding;
    let chosenY = padding;
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * (maxX - padding) + padding;
      const y = Math.random() * (maxY - padding) + padding;
      chosenX = x;
      chosenY = y;
      if (!overlaps(x, y)) break; // found a non-overlapping spot
    }
    setNoButtonPos({ x: chosenX, y: chosenY });
  }, [noAttempts]);

  const handleYesClick = useCallback(() => {
    setYesClicked(true);
  }, []);

  const yesButtonScale = 1 + Math.min(noAttempts, MAX_ATTEMPTS) * 0.15;
  const bgColor = yesClicked ? "rgb(255, 182, 193)" : getBackgroundColor(noAttempts);
  const activeMessage = getActiveMessage(noAttempts);
  const showVideo = noAttempts >= MAX_ATTEMPTS;

  // ── Yes clicked view ─────────────────────────────────────────────
  if (yesClicked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen transition-colors duration-700" style={{ backgroundColor: bgColor }}>
        <div className="text-7xl mb-6 animate-bounce">🎬💕</div>
        <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg text-center px-4">see you on Friday !</h1>
      </div>
    );
  }

  // ── Main view ────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden transition-colors duration-500 select-none" style={{ backgroundColor: bgColor }}>
      {/* Movie Poster / Video */}
      <div ref={posterRef} className="mb-8 rounded-xl overflow-hidden shadow-2xl border-4 border-white/30 hover:border-white/60 transition-colors">
        {showVideo ? <video src="/NoNoNo.mp4" autoPlay loop muted playsInline className="object-cover" style={{ width: 220, height: 330 }} /> : <Image src="/obsession_poster.jpg" alt="Movie Poster" width={220} height={330} className="object-cover" priority />}
      </div>

      {/* Question */}
      <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-12 text-center px-4">Wanna go see a movie with me ?</h1>

      {/* Buttons */}
      <div className="flex gap-8 items-center">
        <button
          ref={yesButtonRef}
          onClick={handleYesClick}
          className="px-8 py-4 bg-green-300 text-white font-bold rounded-full hover:bg-green-600 transition-all shadow-lg origin-center active:scale-95"
          style={{
            transform: `scale(${yesButtonScale})`,
            maxWidth: "90vw",
          }}
        >
          Yes 🩷
        </button>

        {/* No button — in normal flow until first hover */}
        {!hasMoved && (
          <button onMouseEnter={handleNoHover} className="px-8 py-4 bg-red-300 text-white font-bold rounded-full shadow-lg cursor-default">
            No 💔
          </button>
        )}
      </div>

      {/* No button — fixed position after first hover */}
      {hasMoved && (
        <button
          onMouseEnter={handleNoHover}
          onTouchStart={(e) => {
            e.preventDefault();
            handleNoHover();
          }}
          className="px-8 py-4 bg-red-300 text-white font-bold rounded-full shadow-lg cursor-default"
          style={{
            position: "fixed",
            left: noButtonPos.x,
            top: noButtonPos.y,
            zIndex: 50,
            transition: "none",
          }}
        >
          No 💔
        </button>
      )}

      {/* Message & media */}
      {activeMessage && (
        <div ref={messageRef} key={activeMessage.threshold} className="mt-8 flex flex-col items-center gap-3 max-w-lg animate-fade-in">
          {activeMessage.text && <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg text-center px-4">{activeMessage.text}</p>}

          {/* Image placeholder */}
          <div className="w-36 h-36 border-2 border-dashed border-white/40 rounded-xl flex flex-col items-center justify-center text-white/50 text-xs bg-white/5 gap-1">
            <span>🖼️</span>
            <span className="break-all text-center px-1">{activeMessage.image}</span>
          </div>
        </div>
      )}
    </div>
  );
}

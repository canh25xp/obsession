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
  image?: string;
  video?: string;
}

const MESSAGES: MessageDef[] = [
  { threshold: 3, text: "That's not an option", image: "" },
  { threshold: 5, text: "Please ?", image: "/inde_navarrette_frown.jpg" },
  { threshold: 8, text: "You really gonna make me beg aren't you ?", image: "" },
  { threshold: 10, text: "", video: "/NoNoNo.mp4" },
];

function getActiveMessage(attempts: number): MessageDef | null {
  const matched = MESSAGES.filter((m) => m.threshold <= attempts);
  if (matched.length === 0) return null;

  // Carry forward image/video from earlier messages so that if the
  // latest message omits them, the previous media stays on screen.
  let image: string | undefined;
  let video: string | undefined;
  for (const m of matched) {
    if (m.image) image = m.image;
    if (m.video) video = m.video;
  }

  const last = matched[matched.length - 1];
  return { ...last, image, video };
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
      return exclusionZones.some((zone) => left < zone.right + buffer && right > zone.left - buffer && top < zone.bottom + buffer && bottom > zone.top - buffer);
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
        {activeMessage?.video ? (
          <video src={activeMessage.video} autoPlay loop muted playsInline className="object-cover" style={{ width: 220, height: 330 }} />
        ) : activeMessage?.image ? (
          <Image src={activeMessage.image} alt="Message" width={220} height={330} className="object-cover" unoptimized priority />
        ) : (
          <Image src="/obsession_poster.jpg" alt="Movie Poster" width={220} height={330} className="object-cover" priority />
        )}
      </div>

      {/* Question */}
      <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-8 text-center px-4">Wanna go see a movie with me ?</h1>

      {/* Message & media */}
      {activeMessage && (
        <div ref={messageRef} key={activeMessage.threshold} className="mt-2 mb-10 flex flex-col items-center gap-3 max-w-lg animate-fade-in">
          {activeMessage.text && <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg text-center px-4">{activeMessage.text}</p>}
        </div>
      )}

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

        {/* No button — stays in flow (invisible after first hover) to keep layout stable */}
        <button onMouseEnter={handleNoHover} className="px-8 py-4 bg-red-300 text-white font-bold rounded-full shadow-lg cursor-default" style={hasMoved ? { visibility: "hidden" } : undefined}>
          No 💔
        </button>
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
    </div>
  );
}

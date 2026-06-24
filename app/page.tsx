"use client";

import { useState, useCallback, useEffect } from "react";

interface Heart {
  id: number;
  x: number;
  emoji: string;
  delay: number;
}

interface Confetti {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
}

export default function Home() {
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noHoverCount, setNoHoverCount] = useState(0);
  const [saidYes, setSaidYes] = useState(false);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [noButtonVisible, setNoButtonVisible] = useState(false);
  const [mood, setMood] = useState<"hopeful" | "nervous" | "sad">("hopeful");

  useEffect(() => {
    setNoPosition({
      x: window.innerWidth / 2 + 120,
      y: window.innerHeight / 2 + 100,
    });
    setNoButtonVisible(true);
  }, []);

  const handleNoHover = useCallback(() => {
    if (saidYes) return;

    const newCount = noHoverCount + 1;
    setNoHoverCount(newCount);

    if (newCount <= 3) {
      setMood("nervous");
    } else {
      setMood("sad");
    }

    const padding = 100;
    const buttonWidth = 120;
    const buttonHeight = 48;
    const maxX = window.innerWidth - buttonWidth - padding;
    const maxY = window.innerHeight - buttonHeight - padding;
    const minX = padding;
    const minY = padding;

    const newX = Math.random() * (maxX - minX) + minX;
    const newY = Math.random() * (maxY - minY) + minY;

    setNoPosition({ x: newX, y: newY });

    const sadEmojis = ["💔", "😢", "🥺", "😰"];
    const newHeart: Heart = {
      id: Date.now(),
      x: newX + Math.random() * 60,
      emoji: sadEmojis[Math.floor(Math.random() * sadEmojis.length)],
      delay: 0,
    };
    setHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  }, [noHoverCount, saidYes]);

  const handleYes = useCallback(() => {
    setSaidYes(true);
    setMood("hopeful");

    const loveEmojis = ["❤️", "💕", "💖", "💗", "💓", "💘", "💝", "🥰"];
    const newHearts: Heart[] = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      emoji: loveEmojis[Math.floor(Math.random() * loveEmojis.length)],
      delay: Math.random() * 2,
    }));
    setHearts(newHearts);

    const colors = [
      "#ff6b9d",
      "#c44569",
      "#f8a5c2",
      "#f78fb3",
      "#e056a0",
      "#ff9ff3",
      "#f368e0",
      "#ff6348",
      "#ffa502",
      "#7bed9f",
      "#70a1ff",
      "#5352ed",
    ];
    const newConfetti: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i + 100,
      x: Math.random() * window.innerWidth,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 3,
      size: Math.random() * 8 + 4,
    }));
    setConfetti(newConfetti);

    setTimeout(() => {
      setHearts([]);
    }, 4000);
  }, []);

  const getDecorationEmoji = () => {
    if (saidYes) return "🥳";
    switch (mood) {
      case "hopeful":
        return "🥺";
      case "nervous":
        return "😰";
      case "sad":
        return "😢";
    }
  };

  const getDecorationAnimation = () => {
    if (saidYes) return "animate-[celebrate-bounce_0.6s_ease-in-out_infinite]";
    switch (mood) {
      case "hopeful":
        return "animate-[float_3s_ease-in-out_infinite]";
      case "nervous":
        return "animate-[shake_0.5s_ease-in-out_infinite]";
      case "sad":
        return "animate-[shake_0.3s_ease-in-out_infinite]";
    }
  };

  const yesScale = Math.min(1 + noHoverCount * 0.05, 1.5);
  const noScale = Math.max(1 - noHoverCount * 0.03, 0.5);

  const getSubMessage = () => {
    if (saidYes) return "";
    if (noHoverCount === 0) return "";
    if (noHoverCount <= 2) return "That's not an option";
    if (noHoverCount <= 5) return "Please ?";
    if (noHoverCount <= 8) return "Pretty Pleaseeeee";
    return "Actually I bought the ticket already. See you Friday !";
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-100 via-rose-50 to-fuchsia-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"></div>

      {/* Floating background hearts (subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className="absolute text-4xl"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            💕
          </span>
        ))}
      </div>

      {!saidYes ? (
        <>
          {/* Question */}
          <h1
            className="relative z-10 text-4xl md:text-5xl lg:text-6xl font-bold text-rose-600 dark:text-pink-400 mb-4 text-center px-4"
            style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
          >
            Will You go on a date with me?
          </h1>

          {/* Central decoration */}
          <div className="relative z-10 my-8">
            <span
              className={`inline-block text-7xl md:text-8xl ${getDecorationAnimation()}`}
              style={{ transition: "all 0.3s ease" }}
            >
              {getDecorationEmoji()}
            </span>
            {/* Sweat drops when nervous/sad */}
            {(mood === "nervous" || mood === "sad") && (
              <span
                className="absolute -top-2 -right-4 text-2xl"
                style={{ animation: "sweat-drop 1s ease-in-out infinite" }}
              >
                💦
              </span>
            )}
          </div>

          {/* Sub message */}
          <p
            className="relative z-10 text-lg text-rose-500 dark:text-pink-300 mb-8 h-8 text-center transition-all duration-300"
            key={noHoverCount}
          >
            {getSubMessage()}
          </p>

          {/* Yes Button */}
          <button
            onClick={handleYes}
            className="relative z-10 px-10 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            style={{
              transform: `scale(${yesScale})`,
            }}
          >
            Yes 💕
          </button>

          {/* No Button - absolutely positioned, jumps on hover */}
          {noButtonVisible && (
            <button
              onMouseEnter={handleNoHover}
              onTouchStart={handleNoHover}
              className="fixed z-20 px-8 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-lg font-medium rounded-full shadow-md cursor-pointer transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              style={{
                left: `${noPosition.x}px`,
                top: `${noPosition.y}px`,
                transform: `scale(${noScale})`,
                animation: "no-appear 0.3s ease-out",
                transition:
                  "left 0.15s ease, top 0.15s ease, transform 0.3s ease",
              }}
            >
              No 😅
            </button>
          )}
        </>
      ) : (
        /* Celebration Screen */
        <div
          className="relative z-10 flex flex-col items-center justify-center"
          style={{ animation: "celebration-entrance 0.8s ease-out" }}
        >
          <span
            className="text-8xl md:text-9xl mb-6"
            style={{ animation: "celebrate-bounce 0.6s ease-in-out infinite" }}
          >
            🥳
          </span>
          <h1
            className="text-5xl md:text-7xl font-bold text-rose-600 dark:text-pink-400 mb-4"
            style={{ animation: "pulse-glow 1.5s ease-in-out infinite" }}
          >
            Yay! 🎉❤️
          </h1>
          <p className="text-2xl md:text-3xl text-pink-500 dark:text-pink-300 mb-2">
            I knew you'd say yes!
          </p>
          <p className="text-lg text-rose-400 dark:text-pink-400 mt-4">
            🌹 You just made my day 🌹
          </p>
        </div>
      )}

      {/* Floating hearts layer */}
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="fixed z-30 text-3xl pointer-events-none"
          style={{
            left: `${heart.x}px`,
            bottom: "10%",
            animation: "heart-float 2s ease-out forwards",
            animationDelay: `${heart.delay}s`,
          }}
        >
          {heart.emoji}
        </span>
      ))}

      {/* Confetti layer */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="fixed z-30 pointer-events-none rounded-sm"
          style={{
            left: `${c.x}px`,
            width: `${c.size}px`,
            height: `${c.size * 1.5}px`,
            backgroundColor: c.color,
            animation: "confetti-fall 4s ease-in forwards",
            animationDelay: `${c.delay}s`,
          }}
        ></div>
      ))}
    </div>
  );
}

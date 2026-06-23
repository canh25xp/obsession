# 💕 Will You Go On a Date With Me?

A fun, interactive web application that pops the big question — "Will You go on a date with me?" — with a twist: the **No** button refuses to be clicked!

## ✨ Features

- **Dodging No Button** — Every time you hover over the "No" button, it jumps to a random position on the screen, making it impossible to click
- **Growing Yes Button** — The "Yes" button gets slightly larger with each failed attempt to click No, making it even more tempting
- **Reactive Emoji Decoration** — A central emoji reacts to your actions:
  - 🥺 Hopeful and floating (default)
  - 😰 Nervous and shaking (when No is hovered)
  - 😢 Sad and trembling (after many No attempts)
  - 🥳 Celebrating and bouncing (when Yes is clicked!)
- **Escalating Messages** — Dynamic text that gets more desperate the more you try to click No
- **Celebration Screen** — Clicking Yes triggers a full celebration with floating hearts, colorful confetti, and a joyful message
- **Mobile Support** — The No button also dodges touch events on mobile devices
- **Dark Mode** — Supports both light and dark color schemes

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + custom CSS animations
- **Runtime**: React 19

## 🚀 Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
app/
├── page.tsx        # Main interactive component
├── layout.tsx      # Root layout with metadata
├── globals.css     # Tailwind + custom keyframe animations
└── favicon.ico     # App icon
```

## 🎭 How It Works

1. The page displays the question with two buttons: **Yes** and **No**
2. The **No** button uses `onMouseEnter` to detect hover and immediately repositions to a random viewport location
3. A hover counter tracks attempts, driving the emoji mood changes, button size scaling, and escalating messages
4. Clicking **Yes** triggers a celebration state with heart and confetti animations
5. All animations are pure CSS keyframes — no external animation libraries needed

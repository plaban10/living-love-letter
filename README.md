# 🌹 Enchanted Garden Love Letter

An interactive, blooming digital flower meadow and romantic love letter experience built with React 19, TypeScript, Vite, Tailwind CSS, and HTML5 Canvas.

[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> *"I couldn't give you flowers that last forever, so I grew you a meadow that never wilts."*

---

## ✨ Features

### 🌸 Dynamic Living Meadow (60 FPS Canvas)
- **Interactive Cursor Physics**: Wildflowers subtly flex and lean toward your cursor as it moves across the screen, complete with phototropic blossom head tilting and natural harmonic wind sway.
- **Organic Variety**: Flowers spawn with randomized scale factors (`0.82x` to `1.18x`) and subtle organic angular tilts, creating a naturally diverse garden.
- **Interactive Planting**: Click or tap anywhere in the meadow to plant new custom flowers with expanding ripples, drifting star sparkles, and growth animations.
- **Hero Rose Centerpiece**: A majestic multi-layered crimson rose with thorns, lush sepals, and an interactive pulse on touch.
- **Mythical Rare Flowers**: Discover ethereal rare blooms such as the *Crystal Orchid*, *Moonlit Lotus*, and *Solar Blossom* with glowing auras and discovery notifications.
- **Cosmic Sky & Atmosphere**:
  - Switch between **Sunset Glow** and **Deep Midnight Blue**, or toggle **Auto Mode** for periodic transitions.
  - Deep twinkling starfield with diffraction spikes and real-time intensity control.
  - Bioluminescent fireflies with realistic Brownian drifting motion and soft pulsing glows.
  - Rising ambient heart motes.

### 💌 Romantic Love Letter
- **Envelope Opening Sequence**: Interactive wax seal, letter unfold animation, and smooth card transitions powered by Motion.
- **Typewriter Reveal**: Multi-line poetic verses that gracefully fade in.
- **Customizable Details**: Custom recipient, sender, occasion, and romantic message.

### 🔗 URL-Based Sharing (Zero Database Required)
- **Create Your Own**: An intuitive in-app modal to personalize the recipient, sender, occasion, theme, and letter message.
- **Instant Shareable Links**: Letter configurations are encoded directly into URL parameters (`btoa` base64 query/hash), allowing anyone to send a custom eternal meadow with a simple link.

### 🎵 Procedural Web Audio Soundscapes
- Built with the native **Web Audio API** (no external audio assets required).
- Features calming generative wind chimes, soft celestial bells, and gentle harmonic breeze drones upon interaction.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Engine**: Web Audio API (Synthesizer & Chimes)
- **Graphics Engine**: HTML5 2D Canvas API

---

## 📁 Project Structure

```
├── index.html               # Main HTML entry point
├── package.json             # Dependencies and npm scripts
├── metadata.json            # AI Studio app metadata
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build and Tailwind configuration
└── src/
    ├── main.tsx             # Application mount point
    ├── App.tsx              # Main application coordinator
    ├── index.css            # Global styles and Tailwind configuration
    ├── types.ts             # TypeScript types & interfaces
    ├── components/
    │   ├── MeadowCanvas.tsx # 60 FPS HTML5 Canvas meadow simulation
    │   ├── LetterCard.tsx   # Interactive love letter card & envelope
    │   ├── ControlsBar.tsx  # Bottom control dock (stars, sound, themes, sky)
    │   ├── CreateModal.tsx  # Modal to compose and generate shareable links
    │   └── BloomingFlower.tsx # Auxiliary flower render component
    ├── data/
    │   └── presets.ts       # Presets, sky atmospheres, themes, default letter
    └── utils/
        ├── audio.ts         # Procedural Web Audio API sound synthesis
        └── url.ts           # URL encoding/decoding for shareable letters
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/enchanted-garden-love-letter.git
   cd enchanted-garden-love-letter
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000` (or the port specified in your terminal).

---

## 📜 Available Scripts

- `npm run dev` - Launches Vite development server on port 3000.
- `npm run build` - Compiles production-ready bundle into `dist/`.
- `npm run preview` - Previews the production build locally.
- `npm run lint` - Runs TypeScript type checking (`tsc --noEmit`).

---

## 🎨 Themes & Customization

The app includes built-in visual themes configured in `src/data/presets.ts`:

| Theme Key | Name | Aesthetic |
|---|---|---|
| `midnight` | Midnight Serenade | Deep celestial indigo with luminous blossoms |
| `sunset` | Golden Sunset | Warm amber hues, glowing daisies, and coral poppies |
| `lavender` | Twilight Lavender | Soft purple mist with dreamy wisteria and lilac |
| `emerald` | Secret Woodland | Lush forest greens with vibrant wild flora |

You can customize the default recipient and sender in `src/data/presets.ts`:

```typescript
export const DEFAULT_LETTER: LetterData = {
  to: 'Bubu',
  from: 'Dudu',
  occasion: 'just because',
  message: "I couldn't give you flowers|that last forever,|so I grew you a meadow|that never wilts.",
  theme: 'midnight',
};
```

---

## 🌐 Deployment

### Static Hosting (Vercel, Netlify, GitHub Pages)

Run the build command:
```bash
npm run build
```
Deploy the generated `dist/` directory as a Single Page Application (SPA).

#### Deploy to Vercel:
```bash
npx vercel
```

#### Deploy to Netlify:
```bash
npx netlify deploy --prod --dir=dist
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

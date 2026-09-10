import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BloomStage, LetterData, SkyAtmosphere, RareFlowerType } from './types';
import { THEMES, SKY_ATMOSPHERES } from './data/presets';
import { getLetterFromUrl } from './utils/url';
import { sound } from './utils/audio';
import { MeadowCanvas } from './components/MeadowCanvas';
import { LetterCard } from './components/LetterCard';
import { ControlsBar } from './components/ControlsBar';
import { CreateModal } from './components/CreateModal';

export default function App() {
  const [letter, setLetter] = useState<LetterData>(() => getLetterFromUrl());
  const [stage, setStage] = useState<BloomStage>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isCardVisible, setIsCardVisible] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [rosePulseTrigger, setRosePulseTrigger] = useState<number>(0);

  // Atmospheric Sky Transition (Sunset Glow vs. Deep Midnight Blue + Auto Transition)
  const [skyAtmosphere, setSkyAtmosphere] = useState<SkyAtmosphere>('sunset');
  const [isAutoSky, setIsAutoSky] = useState<boolean>(false);

  // Rare Flower Discovery Toast State
  const [rareFlowerToast, setRareFlowerToast] = useState<{
    name: string;
    type: RareFlowerType;
    key: number;
  } | null>(null);

  // Update browser tab title dynamically based on recipient
  useEffect(() => {
    document.title = letter.to ? `For ${letter.to} 🌹` : 'For My Love 🌹';
  }, [letter.to]);

  // Auto-transition loop between Sunset Glow and Midnight Blue when Auto is active
  useEffect(() => {
    if (!isAutoSky) return;
    const interval = window.setInterval(() => {
      setSkyAtmosphere((prev) => (prev === 'sunset' ? 'midnight' : 'sunset'));
    }, 15000);
    return () => window.clearInterval(interval);
  }, [isAutoSky]);

  const activeTheme = THEMES[letter.theme] || THEMES.midnight;
  const currentSky = SKY_ATMOSPHERES[skyAtmosphere];

  const handleRareFlowerFound = (type: RareFlowerType, name: string) => {
    setRareFlowerToast({ name, type, key: Date.now() });
    window.setTimeout(() => {
      setRareFlowerToast((curr) => (curr?.key && Date.now() - curr.key >= 3500 ? null : curr));
    }, 4000);
  };

  // Handle opening the love letter
  const handleOpenLetter = () => {
    if (!soundEnabled) {
      sound.enableSound().then((enabled) => {
        if (enabled) setSoundEnabled(true);
      });
    } else {
      sound.playBloomChime(5);
    }
    setRosePulseTrigger((prev) => prev + 1);
    setStage(5);
    setIsCardVisible(true);
  };

  const handleToggleSound = () => {
    const newState = sound.toggleSound();
    setSoundEnabled(newState);
  };

  const handleReplay = () => {
    setStage(0);
    setIsCardVisible(false);
    sound.playBloomChime(0);
    setRosePulseTrigger((prev) => prev + 1);
  };

  const handleApplyCustomLetter = (newLetter: LetterData) => {
    setLetter(newLetter);
    setStage(0);
    setIsCardVisible(false);
    setRosePulseTrigger((prev) => prev + 1);
  };

  return (
    <div
      id="app-root-container"
      className="relative w-screen h-screen overflow-hidden select-none transition-all duration-1000"
      style={{
        background: currentSky.bgGradient,
      }}
    >
      {/* Warm horizon atmospheric glow that adapts to sky mode */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: currentSky.horizonGlow,
        }}
      />

      {/* Top-Left: Sky Atmosphere Toggle (Sunset Glow vs Deep Midnight Blue + Auto Cycle) */}
      <div
        id="sky-theme-toggle-bar"
        className="fixed top-5 left-4 sm:left-6 z-30 flex items-center gap-1 p-1 rounded-full bg-black/45 backdrop-blur-md border border-white/15 shadow-xl select-none"
      >
        <button
          id="btn-sky-sunset"
          onClick={() => {
            setSkyAtmosphere('sunset');
            setIsAutoSky(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
            skyAtmosphere === 'sunset' && !isAutoSky
              ? 'bg-rose-500/40 text-rose-100 border border-rose-300/40 shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Switch to Sunset Glow"
        >
          <span>🌅</span>
          <span className="hidden sm:inline font-medium tracking-wide">Sunset</span>
        </button>

        <button
          id="btn-sky-midnight"
          onClick={() => {
            setSkyAtmosphere('midnight');
            setIsAutoSky(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
            skyAtmosphere === 'midnight' && !isAutoSky
              ? 'bg-indigo-500/45 text-indigo-100 border border-indigo-300/40 shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Switch to Deep Midnight Blue"
        >
          <span>🌌</span>
          <span className="hidden sm:inline font-medium tracking-wide">Midnight</span>
        </button>

        <div className="w-[1px] h-3.5 bg-white/20 mx-0.5" />

        <button
          id="btn-sky-auto"
          onClick={() => setIsAutoSky((prev) => !prev)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold transition-all duration-300 cursor-pointer ${
            isAutoSky
              ? 'bg-amber-500/40 text-amber-200 border border-amber-300/40 shadow-sm'
              : 'text-white/55 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Auto Atmosphere Transition"
        >
          <span className={isAutoSky ? 'animate-spin inline-block' : 'inline-block'}>⟳</span>
          <span className="text-[10px]">Auto</span>
        </button>
      </div>

      {/* Top-centered pill banner */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none hidden md:block">
        <div className="px-5 py-2 rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-white/90 text-[11px] sm:text-xs tracking-[0.22em] font-medium shadow-lg uppercase whitespace-nowrap">
          ✦ TAP ANYWHERE IN THE MEADOW TO PLANT FLOWERS ✦
        </div>
      </div>

      {/* Rare Flower Discovery Toast Banner */}
      <AnimatePresence>
        {rareFlowerToast && (
          <motion.div
            key={rareFlowerToast.key}
            initial={{ opacity: 0, y: -20, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="fixed top-18 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
            <div
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-xl border shadow-2xl text-xs sm:text-sm font-semibold tracking-wide"
              style={{
                backgroundColor:
                  rareFlowerToast.type === 'crystal_orchid'
                    ? 'rgba(8, 47, 73, 0.88)'
                    : rareFlowerToast.type === 'star_lotus'
                    ? 'rgba(74, 15, 68, 0.88)'
                    : 'rgba(74, 45, 10, 0.88)',
                borderColor:
                  rareFlowerToast.type === 'crystal_orchid'
                    ? 'rgba(56, 189, 248, 0.7)'
                    : rareFlowerToast.type === 'star_lotus'
                    ? 'rgba(232, 121, 249, 0.7)'
                    : 'rgba(250, 204, 21, 0.7)',
                color: '#ffffff',
                boxShadow:
                  rareFlowerToast.type === 'crystal_orchid'
                    ? '0 0 25px rgba(56, 189, 248, 0.45)'
                    : rareFlowerToast.type === 'star_lotus'
                    ? '0 0 25px rgba(232, 121, 249, 0.45)'
                    : '0 0 25px rgba(250, 204, 21, 0.45)',
              }}
            >
              <span className="text-base animate-bounce">
                {rareFlowerToast.type === 'crystal_orchid'
                  ? '💠'
                  : rareFlowerToast.type === 'star_lotus'
                  ? '🪷'
                  : '✨'}
              </span>
              <span>
                Discovered Rare{' '}
                <span className="underline decoration-wavy underline-offset-2 font-bold">
                  {rareFlowerToast.name}
                </span>
                !
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Create Yours 🌸" button in top-right corner */}
      <button
        id="btn-quick-create"
        onClick={() => setIsCreateOpen(true)}
        className="fixed top-5 right-4 sm:right-6 z-30 px-4 py-2 rounded-full text-xs font-medium text-white/90 bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all cursor-pointer shadow-md"
      >
        Create Yours 🌸
      </button>

      {/* Living interactive meadow canvas with stars, fireflies, stems, wildflowers, hero Red Rose, and floating hearts */}
      <MeadowCanvas
        stage={stage}
        theme={activeTheme}
        atmosphere={skyAtmosphere}
        starIntensity={currentSky.starIntensity}
        interactive={true}
        pulseTrigger={rosePulseTrigger}
        onRoseClick={() => setRosePulseTrigger((prev) => prev + 1)}
        onRareFlowerFound={handleRareFlowerFound}
      />

      {/* Main Interactive Stage Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 pointer-events-none">
        
        {/* OPEN MY LOVE LETTER Button overlaying the upper-middle stem below the unobstructed rose head */}
        <AnimatePresence>
          {!isCardVisible && (
            <motion.div
              id="stage-progress-button-container"
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="fixed top-[59%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
            >
              <button
                id="btn-bloom-advance"
                onClick={handleOpenLetter}
                className="group relative px-8 sm:px-10 py-3.5 sm:py-4 rounded-full border text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 backdrop-blur-md shadow-2xl cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-3"
                style={{
                  borderColor: 'rgba(140, 210, 170, 0.45)',
                  backgroundColor: 'rgba(34, 58, 46, 0.62)',
                  color: '#ffffff',
                  boxShadow: '0 10px 30px rgba(15, 38, 25, 0.45), 0 0 20px rgba(70, 160, 110, 0.22)',
                }}
              >
                {/* Subtle soft glowing border pulse */}
                <span
                  className="absolute inset-0 rounded-full opacity-60 group-hover:opacity-100 transition-opacity blur-xs pointer-events-none"
                  style={{
                    border: '1.5px solid rgba(140, 210, 170, 0.5)',
                  }}
                />
                <span className="relative z-10 font-medium tracking-widest text-white drop-shadow">
                  OPEN MY LOVE LETTER
                </span>
                <span className="relative z-10 text-base transition-transform group-hover:scale-115">
                  💌
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STAGE 5: Love Letter Card */}
        <AnimatePresence>
          {isCardVisible && (
            <div className="pointer-events-auto">
              <LetterCard
                letter={letter}
                theme={activeTheme}
                isVisible={isCardVisible}
                onClose={() => setIsCardVisible(false)}
              />
            </div>
          )}
        </AnimatePresence>

      </div>

      {/* STAGE 5: Persistent Bottom Controls Bar */}
      <AnimatePresence>
        {stage === 5 && (
          <ControlsBar
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            isCardVisible={isCardVisible}
            onToggleCard={() => setIsCardVisible((prev) => !prev)}
            onReplay={handleReplay}
            onOpenCreate={() => setIsCreateOpen(true)}
            theme={activeTheme}
          />
        )}
      </AnimatePresence>

      {/* "Create Yours" Modal (Matching Screenshots 9 & 10) */}
      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        currentLetter={letter}
        onApplyLetter={handleApplyCustomLetter}
      />
    </div>
  );
}


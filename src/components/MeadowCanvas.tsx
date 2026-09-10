import React, { useEffect, useRef } from 'react';
import { BloomStage, VisualTheme, SkyAtmosphere, RareFlowerType } from '../types';
import { sound } from '../utils/audio';

interface MeadowCanvasProps {
  stage: BloomStage;
  theme: VisualTheme;
  atmosphere?: SkyAtmosphere;
  starIntensity?: number;
  interactive?: boolean;
  pulseTrigger?: number;
  onRoseClick?: () => void;
  onRareFlowerFound?: (type: RareFlowerType, name: string) => void;
}

interface Star {
  x: number; // 0 to 1
  y: number; // 0 to 1
  radius: number;
  baseAlpha: number;
  phase: number;
  twinkleSpeed: number;
  secondarySpeed: number;
  color: string;
  hasGlow: boolean;
  spikeLength: number;
}

interface Firefly {
  x: number;
  y: number;
  speed: number;
  heading: number;
  turnRate: number;
  wanderSeed: number;
  radius: number;
  baseAlpha: number;
  glowRadius: number;
  color: string;
  haloColor: string;
  blinkTimer: number;
  blinkInterval: number;
  blinkDuration: number;
  isBlinking: boolean;
  blinkProgress: number;
}

interface FloatingHeart {
  x: number;
  y: number;
  vy: number;
  size: number;
  baseAlpha: number;
  swaySpeed: number;
  swayAmp: number;
  swayOffset: number;
  rotation: number;
  colorPrefix: string;
}

interface ClickFeedbackRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  decay: number;
  color: string;
  lineWidth: number;
}

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
}

interface LeafData {
  relY: number;
  side: -1 | 1;
  length: number;
}

export type AnyFlowerType = 'daisy' | 'sunflower' | 'poppy' | 'lavender' | 'rose' | RareFlowerType;

interface FlowerInstance {
  x: number; // 0 to 1 normalized
  targetHeight: number;
  currentHeight: number;
  swaySpeed: number;
  swayOffset: number;
  curveFactor: number;
  type: AnyFlowerType;
  petalColor: string;
  centerColor: string;
  size: number;
  bloomProgress: number;
  leaves: LeafData[];
  interactiveLean: number; // dynamic stem lean following cursor
  interactiveTilt: number; // subtle flower head rotation facing cursor
  scale?: number; // organic scale variation (e.g. 0.82 to 1.18)
  rotation?: number; // organic slight rotation/tilt (e.g. -0.22 to +0.22 rad)
  isRare?: boolean;
  rareType?: RareFlowerType;
  rareAuraPulse?: number;
}

interface HeroRose {
  baseX: number;
  baseY: number;
  tipX: number;
  tipY: number;
  targetHeight: number;
  currentHeight: number;
  sway: number;
  size: number;
  bloomProgress: number;
  pulseScale: number;
  interactiveLean: number;
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  life: number;
}

export const MeadowCanvas: React.FC<MeadowCanvasProps> = ({
  stage,
  theme,
  atmosphere = 'sunset',
  starIntensity = 1.0,
  interactive = true,
  pulseTrigger = 0,
  onRoseClick,
  onRareFlowerFound,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flowersRef = useRef<FlowerInstance[]>([]);
  const starsRef = useRef<Star[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const floatingHeartsRef = useRef<FloatingHeart[]>([]);
  const sparklesRef = useRef<SparkleParticle[]>([]);
  const feedbackRingsRef = useRef<ClickFeedbackRing[]>([]);
  const dustMotesRef = useRef<DustMote[]>([]);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  // Store atmosphere & starIntensity in refs for access inside the 60fps render loop
  const atmosphereRef = useRef<SkyAtmosphere>(atmosphere);
  atmosphereRef.current = atmosphere;
  const starIntensityRef = useRef<number>(starIntensity);
  starIntensityRef.current = starIntensity;

  // Hero central towering rose state
  const heroRoseRef = useRef<HeroRose>({
    baseX: 0,
    baseY: 0,
    tipX: 0,
    tipY: 0,
    targetHeight: 380,
    currentHeight: 60,
    sway: 0,
    size: 68,
    bloomProgress: 0.1,
    pulseScale: 1.0,
    interactiveLean: 0,
  });

  // Pulse animation on trigger
  const triggerRoseBloomPulse = () => {
    const rose = heroRoseRef.current;
    rose.pulseScale = 1.32;

    // Spawn radiant burst of golden and crimson star sparkles
    const sparkles: SparkleParticle[] = [];
    const colors = ['#ffe178', '#ff3864', '#ff85a1', '#ffffff', '#ffd166', '#ff4d6d'];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      sparkles.push({
        x: rose.tipX + (Math.random() - 0.5) * 20,
        y: rose.tipY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        alpha: 1.0,
        size: 2.5 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.12,
        life: 0.02 + Math.random() * 0.015,
      });
    }
    sparklesRef.current = [...sparklesRef.current, ...sparkles];

    // Shockwave ring around the blooming rose head
    feedbackRingsRef.current.push({
      x: rose.tipX,
      y: rose.tipY,
      radius: 12,
      maxRadius: rose.size * 1.8,
      alpha: 0.85,
      decay: 0.022,
      color: 'rgba(255, 120, 160,',
      lineWidth: 2.4,
    });
  };

  useEffect(() => {
    if (pulseTrigger > 0) {
      triggerRoseBloomPulse();
    }
  }, [pulseTrigger]);

  // Initialize deep, multi-tiered twinkling star-field, drifting fireflies, and romantic floating hearts
  useEffect(() => {
    const stars: Star[] = [];
    const starColors = ['#ffffff', '#fef3c7', '#e0f2fe', '#fce7f3', '#fffbeb', '#93c5fd'];

    // 135 stars spanning deep cosmic background
    for (let i = 0; i < 135; i++) {
      const isCosmicSparkler = i < 18;
      const isMidStar = i >= 18 && i < 65;

      const radius = isCosmicSparkler
        ? 1.9 + Math.random() * 1.1
        : isMidStar
        ? 1.0 + Math.random() * 0.7
        : 0.45 + Math.random() * 0.5;

      const baseAlpha = isCosmicSparkler
        ? 0.55 + Math.random() * 0.4
        : isMidStar
        ? 0.35 + Math.random() * 0.45
        : 0.15 + Math.random() * 0.35;

      stars.push({
        x: Math.random(),
        y: Math.random() * 0.78,
        radius,
        baseAlpha,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.0018 + Math.random() * 0.0035,
        secondarySpeed: 0.0004 + Math.random() * 0.0009,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        hasGlow: isCosmicSparkler,
        spikeLength: 5 + Math.random() * 7,
      });
    }
    starsRef.current = stars;

    // Initialize lazy-drifting fireflies
    const fireflies: Firefly[] = [];
    const flyPalettes = [
      { color: '#ffe66d', halo: 'rgba(255, 220, 70,' },
      { color: '#e2f97a', halo: 'rgba(210, 245, 90,' },
      { color: '#ffd166', halo: 'rgba(255, 195, 60,' },
      { color: '#a7f3d0', halo: 'rgba(130, 240, 190,' },
    ];

    for (let i = 0; i < 38; i++) {
      const pal = flyPalettes[Math.floor(Math.random() * flyPalettes.length)];
      fireflies.push({
        x: Math.random(),
        y: 0.12 + Math.random() * 0.82,
        speed: 0.00028 + Math.random() * 0.00045,
        heading: Math.random() * Math.PI * 2,
        turnRate: 0.02 + Math.random() * 0.025,
        wanderSeed: Math.random() * 100,
        radius: 1.6 + Math.random() * 1.5,
        baseAlpha: 0.28 + Math.random() * 0.32,
        glowRadius: 10 + Math.random() * 12,
        color: pal.color,
        haloColor: pal.halo,
        blinkTimer: Math.random() * 4000,
        blinkInterval: 2800 + Math.random() * 5200,
        blinkDuration: 900 + Math.random() * 700,
        isBlinking: false,
        blinkProgress: 0,
      });
    }
    firefliesRef.current = fireflies;

    // Initialize romantic floating hearts that slowly rise from the meadow toward the sky
    const heartColors = [
      'rgba(255, 82, 118,',
      'rgba(255, 138, 168,',
      'rgba(255, 50, 95,',
      'rgba(255, 185, 205,',
      'rgba(254, 205, 211,',
      'rgba(251, 113, 133,',
    ];

    const hearts: FloatingHeart[] = [];
    const winW = window.innerWidth || 1200;
    const winH = window.innerHeight || 800;

    for (let i = 0; i < 22; i++) {
      hearts.push({
        x: Math.random() * winW,
        y: winH * 0.3 + Math.random() * winH * 0.75, // distributed across screen height initially
        vy: 0.35 + Math.random() * 0.65, // slow, dreamy upward float
        size: 9 + Math.random() * 14, // 9px to 23px
        baseAlpha: 0.32 + Math.random() * 0.38,
        swaySpeed: 0.0012 + Math.random() * 0.0018,
        swayAmp: 14 + Math.random() * 20,
        swayOffset: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.3,
        colorPrefix: heartColors[Math.floor(Math.random() * heartColors.length)],
      });
    }
    floatingHeartsRef.current = hearts;
  }, []);

  // Initialize meadow wildflowers: spacious, airy distribution
  useEffect(() => {
    const isEnchanted = theme.id === 'enchanted';
    const isMorning = theme.id === 'morning';
    const isVintage = theme.id === 'vintage';

    const daisyPetal = isEnchanted ? '#d0fff6' : isMorning ? '#fff5eb' : isVintage ? '#fceddb' : '#ffffff';
    const poppyPetal = isEnchanted ? '#1fc7a4' : isMorning ? '#ff6347' : isVintage ? '#b82046' : '#ea2849';
    const sunflowerPetal = isEnchanted ? '#85f58c' : isMorning ? '#ffba42' : '#f5be28';
    const lavenderPetal = isEnchanted ? '#52deb3' : isMorning ? '#ad7fe0' : isVintage ? '#9c6680' : '#945dd6';
    const coralPetal = '#ff6153';

    // 24 spaced flowers across panoramic width with deliberate center clearance for Hero Rose & Button
    const flowerConfigs: Array<{
      xPct: number;
      type: FlowerInstance['type'];
      petal: string;
      center: string;
      size: number;
      hRatio: number;
    }> = [
      { xPct: 0.02, type: 'daisy', petal: daisyPetal, center: '#ffca28', size: 14, hRatio: 0.48 },
      { xPct: 0.06, type: 'sunflower', petal: sunflowerPetal, center: '#3f1f0e', size: 22, hRatio: 0.58 },
      { xPct: 0.10, type: 'poppy', petal: poppyPetal, center: '#1c0309', size: 17, hRatio: 0.36 },
      { xPct: 0.13, type: 'lavender', petal: lavenderPetal, center: '#4c2578', size: 13, hRatio: 0.52 },
      { xPct: 0.17, type: 'daisy', petal: daisyPetal, center: '#ffca28', size: 16, hRatio: 0.54 },
      { xPct: 0.21, type: 'poppy', petal: coralPetal, center: '#1c0309', size: 18, hRatio: 0.42 },
      { xPct: 0.25, type: 'sunflower', petal: sunflowerPetal, center: '#3f1f0e', size: 20, hRatio: 0.60 },
      { xPct: 0.29, type: 'sunflower', petal: sunflowerPetal, center: '#3f1f0e', size: 21, hRatio: 0.56 },
      { xPct: 0.33, type: 'lavender', petal: lavenderPetal, center: '#4c2578', size: 14, hRatio: 0.50 },
      { xPct: 0.36, type: 'daisy', petal: daisyPetal, center: '#ffca28', size: 14, hRatio: 0.44 },
      { xPct: 0.39, type: 'poppy', petal: poppyPetal, center: '#1c0309', size: 17, hRatio: 0.48 },
      // Central corridor [0.40 - 0.60] left open for Hero Rose & Button
      { xPct: 0.61, type: 'poppy', petal: poppyPetal, center: '#1c0309', size: 17, hRatio: 0.46 },
      { xPct: 0.64, type: 'daisy', petal: daisyPetal, center: '#ffca28', size: 15, hRatio: 0.52 },
      { xPct: 0.67, type: 'sunflower', petal: sunflowerPetal, center: '#3f1f0e', size: 20, hRatio: 0.42 },
      { xPct: 0.70, type: 'lavender', petal: lavenderPetal, center: '#4c2578', size: 13, hRatio: 0.49 },
      { xPct: 0.74, type: 'sunflower', petal: sunflowerPetal, center: '#3f1f0e', size: 22, hRatio: 0.61 },
      { xPct: 0.78, type: 'poppy', petal: poppyPetal, center: '#1c0309', size: 18, hRatio: 0.46 },
      { xPct: 0.81, type: 'daisy', petal: daisyPetal, center: '#ffca28', size: 15, hRatio: 0.50 },
      { xPct: 0.85, type: 'sunflower', petal: sunflowerPetal, center: '#3f1f0e', size: 21, hRatio: 0.57 },
      { xPct: 0.88, type: 'poppy', petal: coralPetal, center: '#1c0309', size: 17, hRatio: 0.38 },
      { xPct: 0.91, type: 'lavender', petal: lavenderPetal, center: '#4c2578', size: 13, hRatio: 0.51 },
      { xPct: 0.94, type: 'daisy', petal: daisyPetal, center: '#ffca28', size: 14, hRatio: 0.45 },
      { xPct: 0.97, type: 'poppy', petal: poppyPetal, center: '#1c0309', size: 18, hRatio: 0.55 },
    ];

    const flowers: FlowerInstance[] = [];

    flowerConfigs.forEach((cfg) => {
      const targetHeight = Math.max(160, Math.min(window.innerHeight * cfg.hRatio, 460));

      const leavesCount = 2 + Math.floor(Math.random() * 2);
      const leaves: LeafData[] = [];
      for (let l = 0; l < leavesCount; l++) {
        leaves.push({
          relY: 0.3 + (l / leavesCount) * 0.45 + Math.random() * 0.08,
          side: l % 2 === 0 ? -1 : 1,
          length: 12 + Math.random() * 8,
        });
      }

      flowers.push({
        x: cfg.xPct,
        targetHeight,
        currentHeight: 18,
        swaySpeed: 0.0011 + Math.random() * 0.0008,
        swayOffset: Math.random() * Math.PI * 2,
        curveFactor: (Math.random() - 0.5) * 20,
        type: cfg.type,
        petalColor: cfg.petal,
        centerColor: cfg.center,
        size: cfg.size,
        scale: 0.92 + Math.random() * 0.16,
        rotation: (Math.random() - 0.5) * 0.25,
        bloomProgress: 0,
        leaves,
        interactiveLean: 0,
        interactiveTilt: 0,
      });
    });

    flowersRef.current = flowers;
  }, [theme]);

  // Pointer tracking for cursor position and hover illumination
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handlePointerLeave = () => {
    mousePosRef.current.active = false;
  };

  // Click handler on canvas with rare glowing flowers & feedback effects
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const rose = heroRoseRef.current;
    const dx = clickX - rose.tipX;
    const dy = clickY - rose.tipY;
    const distToRoseHead = Math.sqrt(dx * dx + dy * dy);

    // Direct click on or near the central red rose head or upper stem
    if (distToRoseHead < rose.size * 1.5 || (Math.abs(clickX - rose.baseX) < 55 && clickY < rose.baseY && clickY > rose.tipY - 30)) {
      triggerRoseBloomPulse();
      sound.playBloomChime(4);
      if (onRoseClick) onRoseClick();
      return;
    }

    // 1. Visual Feedback at Cursor Coordinates:
    // Expanding soft rings
    feedbackRingsRef.current.push({
      x: clickX,
      y: clickY,
      radius: 4,
      maxRadius: 46,
      alpha: 0.95,
      decay: 0.024,
      color: 'rgba(255, 232, 160,',
      lineWidth: 2.2,
    });
    feedbackRingsRef.current.push({
      x: clickX,
      y: clickY,
      radius: 2,
      maxRadius: 30,
      alpha: 0.7,
      decay: 0.03,
      color: 'rgba(167, 243, 208,',
      lineWidth: 1.4,
    });

    // Expanding botanical dust cloud / pollen motes
    const dustColors = ['#fef08a', '#fde047', '#a7f3d0', '#ffffff', '#fed7aa', '#f472b6'];
    for (let d = 0; d < 15; d++) {
      const dAngle = Math.random() * Math.PI * 2;
      const dSpeed = 0.8 + Math.random() * 3.0;
      dustMotesRef.current.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(dAngle) * dSpeed,
        vy: Math.sin(dAngle) * dSpeed - 0.6,
        radius: 1.8 + Math.random() * 2.2,
        alpha: 0.85,
        decay: 0.016 + Math.random() * 0.014,
        color: dustColors[Math.floor(Math.random() * dustColors.length)],
      });
    }

    // Spawn 2 romantic floating hearts rising from the click spot!
    for (let h = 0; h < 2; h++) {
      floatingHeartsRef.current.push({
        x: clickX + (Math.random() - 0.5) * 20,
        y: clickY + (Math.random() - 0.5) * 10,
        vy: 0.45 + Math.random() * 0.5,
        size: 10 + Math.random() * 12,
        baseAlpha: 0.65,
        swaySpeed: 0.0016 + Math.random() * 0.0015,
        swayAmp: 16 + Math.random() * 14,
        swayOffset: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.3,
        colorPrefix: Math.random() > 0.5 ? 'rgba(255, 80, 120,' : 'rgba(255, 140, 180,',
      });
    }

    // 2. Determine Flower Type: Standard vs. Rare Glowing Flower
    // ~18% probability of spawning a rare glowing celestial flower!
    const roll = Math.random();
    const isRare = roll < 0.18;
    let chosenType: AnyFlowerType;
    let petalColor = '#ffffff';
    let centerColor = '#ffca28';
    let rareType: RareFlowerType | undefined;
    let size = 16;

    if (isRare) {
      const rareTypes: RareFlowerType[] = ['crystal_orchid', 'star_lotus', 'golden_celestial'];
      rareType = rareTypes[Math.floor(Math.random() * rareTypes.length)];
      chosenType = rareType;

      if (rareType === 'crystal_orchid') {
        petalColor = '#a5f3fc';
        centerColor = '#06b6d4';
        size = 23;
        if (onRareFlowerFound) onRareFlowerFound('crystal_orchid', 'Crystal Orchid');
      } else if (rareType === 'star_lotus') {
        petalColor = '#f472b6';
        centerColor = '#c084fc';
        size = 24;
        if (onRareFlowerFound) onRareFlowerFound('star_lotus', 'Star Lotus');
      } else {
        petalColor = '#fde047';
        centerColor = '#f59e0b';
        size = 23;
        if (onRareFlowerFound) onRareFlowerFound('golden_celestial', 'Golden Celestial');
      }

      // Play celestial chime for rare discovery
      sound.playRareDiscovery();

      // Spawn extra iridescent sparkles for the rare flower discovery
      for (let s = 0; s < 18; s++) {
        const sAngle = Math.random() * Math.PI * 2;
        const sSpeed = 1.2 + Math.random() * 3.8;
        sparklesRef.current.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(sAngle) * sSpeed,
          vy: Math.sin(sAngle) * sSpeed - 1.2,
          alpha: 1.0,
          size: 3.0 + Math.random() * 3.5,
          color: rareType === 'crystal_orchid' ? '#67e8f9' : rareType === 'star_lotus' ? '#f472b6' : '#fde047',
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: 0.12,
          life: 0.02,
        });
      }
    } else {
      const types: Array<FlowerInstance['type']> = ['daisy', 'sunflower', 'poppy', 'lavender'];
      chosenType = types[Math.floor(Math.random() * types.length)];
      petalColor =
        chosenType === 'daisy'
          ? '#ffffff'
          : chosenType === 'sunflower'
          ? '#f5be28'
          : chosenType === 'poppy'
          ? '#ea2849'
          : '#945dd6';

      centerColor =
        chosenType === 'sunflower' ? '#3f1f0e' : chosenType === 'daisy' ? '#ffca28' : chosenType === 'poppy' ? '#1c0309' : '#4c2578';

      size = chosenType === 'sunflower' ? 20 : chosenType === 'daisy' ? 15 : 17;
      sound.playBloomChime(2);
    }

    const xPct = Math.max(0.02, Math.min(0.98, clickX / canvasRef.current.width));

    const leaves: LeafData[] = [
      { relY: 0.35, side: -1, length: 14 },
      { relY: 0.65, side: 1, length: 14 },
    ];

    // Randomize scale and rotation slightly for a natural, organic garden appearance
    const randomScale = 0.82 + Math.random() * 0.36; // natural scale variation (~0.82x to 1.18x)
    const randomRotation = (Math.random() - 0.5) * 0.44; // natural organic tilt (~ -12.5° to +12.5°)

    flowersRef.current.push({
      x: xPct,
      targetHeight: Math.max(160, Math.min(canvasRef.current.height * 0.52, 430)) * (0.90 + Math.random() * 0.20),
      currentHeight: 12,
      swaySpeed: 0.0012 + Math.random() * 0.0008,
      swayOffset: Math.random() * Math.PI * 2,
      curveFactor: (Math.random() - 0.5) * 22,
      type: chosenType,
      petalColor,
      centerColor,
      size,
      scale: randomScale,
      rotation: randomRotation,
      bloomProgress: 0,
      leaves,
      interactiveLean: 0,
      interactiveTilt: 0,
      isRare,
      rareType,
      rareAuraPulse: 0,
    });

    // Subtle click star sparkles
    for (let i = 0; i < 8; i++) {
      sparklesRef.current.push({
        x: clickX,
        y: clickY,
        vx: (Math.random() - 0.5) * 2.8,
        vy: (Math.random() - 0.5) * 2.8 - 1,
        alpha: 0.9,
        size: 2.5 + Math.random() * 3,
        color: '#ffdd77',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: 0.1,
        life: 0.025,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Global pointer move tracking for magical illumination across the entire viewport
    const onWindowPointerMove = (e: PointerEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        mousePosRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          active: true,
        };
      }
    };

    const onWindowPointerLeave = () => {
      mousePosRef.current.active = false;
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    document.addEventListener('mouseleave', onWindowPointerLeave);

    // Dedicated helper: Draw smooth Bezier romantic heart
    const drawHeart = (
      cx: number,
      cy: number,
      size: number,
      rot: number,
      colorPrefix: string,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      ctx.beginPath();
      const topCurveHeight = size * 0.32;
      ctx.moveTo(0, topCurveHeight);
      // Left lobule
      ctx.bezierCurveTo(-size * 0.55, -topCurveHeight, -size * 0.85, topCurveHeight * 0.45, 0, size * 0.9);
      // Right lobule
      ctx.bezierCurveTo(size * 0.85, topCurveHeight * 0.45, size * 0.55, -topCurveHeight, 0, topCurveHeight);
      ctx.closePath();

      // Dreamy translucent fill with soft glow
      ctx.fillStyle = `${colorPrefix} ${alpha.toFixed(3)})`;
      ctx.shadowColor = `${colorPrefix} ${(alpha * 0.7).toFixed(3)})`;
      ctx.shadowBlur = size * 0.5;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();
    };

    // Dedicated helper: Lush Distinctive Cartoon Rose Leaf
    const drawDistinctiveRoseLeaf = (
      x: number,
      y: number,
      angle: number,
      length: number,
      width: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(width * 0.8, -length * 0.35, width * 0.9, -length * 0.75, 0, -length);
      ctx.bezierCurveTo(-width * 0.9, -length * 0.75, -width * 0.8, -length * 0.35, 0, 0);

      ctx.fillStyle = '#267b49';
      ctx.fill();
      ctx.strokeStyle = '#114224';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -length * 0.92);
      ctx.strokeStyle = '#43ba72';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      for (let v = 1; v <= 4; v++) {
        const vy = -length * (0.2 + v * 0.16);
        ctx.beginPath();
        ctx.moveTo(0, vy);
        ctx.lineTo(width * 0.45, vy - 4);
        ctx.moveTo(0, vy);
        ctx.lineTo(-width * 0.45, vy - 4);
        ctx.strokeStyle = 'rgba(67, 186, 114, 0.65)';
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      ctx.restore();
    };

    // Dedicated helper: Layered 2D Petal
    const drawRosePetal = (
      pWidth: number,
      pHeight: number,
      fillColor: string,
      strokeColor: string,
      highlightColor: string
    ) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(pWidth * 0.9, -pHeight * 0.4, pWidth * 0.85, -pHeight * 0.85, 0, -pHeight);
      ctx.bezierCurveTo(-pWidth * 0.85, -pHeight * 0.85, -pWidth * 0.9, -pHeight * 0.4, 0, 0);

      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -pHeight * 0.65, pWidth * 0.45, -Math.PI * 0.7, -Math.PI * 0.3);
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    };

    // Dedicated helper: Towering Crimson Rose Blossom Head
    const drawMajesticRoseHead = (
      cx: number,
      cy: number,
      baseRadius: number,
      bloomProgress: number,
      pulseScale: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy);

      const effSize = baseRadius * bloomProgress * pulseScale;

      // Calyx Sepals
      const sepals = 5;
      for (let s = 0; s < sepals; s++) {
        ctx.save();
        ctx.rotate((s * Math.PI * 2) / sepals + Math.PI / 5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(effSize * 0.3, effSize * 0.4, effSize * 0.1, effSize * 0.85);
        ctx.quadraticCurveTo(-effSize * 0.15, effSize * 0.5, 0, 0);
        ctx.fillStyle = '#1e683e';
        ctx.fill();
        ctx.strokeStyle = '#0f3a20';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Ambient soft petal shadow
      ctx.beginPath();
      ctx.ellipse(0, 0, effSize * 0.95, effSize * 0.95, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(70, 0, 18, 0.4)';
      ctx.fill();

      // LAYER 1: Outer Cupped Crimson Petals
      const petalsL1 = 6;
      const l1Width = effSize * 0.68;
      const l1Height = effSize * 0.98;
      for (let i = 0; i < petalsL1; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / petalsL1);
        drawRosePetal(l1Width, l1Height, '#c81335', '#880a22', '#ff4d72');
        ctx.restore();
      }

      // LAYER 2: Mid-Outer Petals
      const petalsL2 = 6;
      const l2Width = effSize * 0.54;
      const l2Height = effSize * 0.84;
      for (let i = 0; i < petalsL2; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / petalsL2 + Math.PI / 6);
        drawRosePetal(l2Width, l2Height, '#db163c', '#980c27', '#ff6186');
        ctx.restore();
      }

      // LAYER 3: Mid-Inner Petals
      const petalsL3 = 5;
      const l3Width = effSize * 0.44;
      const l3Height = effSize * 0.70;
      for (let i = 0; i < petalsL3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / petalsL3 + Math.PI / 10);
        drawRosePetal(l3Width, l3Height, '#ee224c', '#b01234', '#ff789a');
        ctx.restore();
      }

      // LAYER 4: Inner Spiral Swirl Petals
      const petalsL4 = 4;
      const l4Width = effSize * 0.35;
      const l4Height = effSize * 0.54;
      for (let i = 0; i < petalsL4; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / petalsL4 + 0.3 + i * 0.4);
        drawRosePetal(l4Width, l4Height, '#f62f59', '#c4163b', '#ffa3b8');
        ctx.restore();
      }

      // LAYER 5: Center Heart & Golden Pollen Core
      ctx.beginPath();
      ctx.ellipse(0, 0, effSize * 0.24, effSize * 0.24, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#680015';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, effSize * 0.15, 0.4, Math.PI * 1.6);
      ctx.strokeStyle = '#ff6f8f';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.stroke();

      for (let st = 0; st < 6; st++) {
        const sa = (st * Math.PI * 2) / 6;
        const sr = effSize * 0.10;
        ctx.beginPath();
        ctx.arc(Math.cos(sa) * sr, Math.sin(sa) * sr, 2.0, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe075';
        ctx.fill();
      }

      ctx.restore();
    };

    // Dedicated helper: Draw Rare Glowing Flowers with ethereal radiance
    const drawRareFlower = (
      type: RareFlowerType,
      size: number,
      bloom: number,
      rarePulse: number
    ) => {
      const curSize = size * bloom;
      const pulseFactor = 1.0 + 0.12 * Math.sin(rarePulse);

      if (type === 'crystal_orchid') {
        // Ethereal Pulsing Cyan Aura
        ctx.beginPath();
        ctx.arc(0, -curSize * 0.4, curSize * 1.4 * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.fill();

        // 5 Iridescent Diamond Petals
        for (let p = 0; p < 5; p++) {
          ctx.save();
          ctx.rotate((p * Math.PI * 2) / 5 - Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(curSize * 0.35, -curSize * 0.6);
          ctx.lineTo(0, -curSize * 1.25);
          ctx.lineTo(-curSize * 0.35, -curSize * 0.6);
          ctx.closePath();

          ctx.fillStyle = p % 2 === 0 ? '#38bdf8' : '#7dd3fc';
          ctx.fill();
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Crystalline facet highlights
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -curSize * 1.15);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
        }

        // Luminous Core
        ctx.beginPath();
        ctx.arc(0, 0, curSize * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = '#f0fdfa';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (type === 'star_lotus') {
        // Radiant Magenta Halo
        ctx.beginPath();
        ctx.arc(0, -curSize * 0.3, curSize * 1.35 * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(217, 70, 239, 0.24)';
        ctx.fill();

        // 8 Lotus Petals
        for (let p = 0; p < 8; p++) {
          ctx.save();
          ctx.rotate((p * Math.PI * 2) / 8);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(curSize * 0.45, -curSize * 0.5, 0, -curSize * 1.1);
          ctx.quadraticCurveTo(-curSize * 0.45, -curSize * 0.5, 0, 0);
          ctx.fillStyle = p % 2 === 0 ? '#e879f9' : '#f472b6';
          ctx.fill();
          ctx.strokeStyle = '#fae8ff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }

        // Star-shaped Diamond Core
        ctx.beginPath();
        ctx.arc(0, 0, curSize * 0.34, 0, Math.PI * 2);
        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // 'golden_celestial'
        // Solar Golden Halo
        ctx.beginPath();
        ctx.arc(0, -curSize * 0.35, curSize * 1.45 * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
        ctx.fill();

        // 10 Radiant Star Petals
        for (let p = 0; p < 10; p++) {
          ctx.save();
          ctx.rotate((p * Math.PI * 2) / 10);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(curSize * 0.35, -curSize * 0.4, curSize * 0.25, -curSize * 0.8, 0, -curSize * 1.15);
          ctx.bezierCurveTo(-curSize * 0.25, -curSize * 0.8, -curSize * 0.35, -curSize * 0.4, 0, 0);
          ctx.fillStyle = p % 2 === 0 ? '#facc15' : '#fef08a';
          ctx.fill();
          ctx.strokeStyle = '#fffbeb';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Star tip accent
          ctx.beginPath();
          ctx.arc(0, -curSize * 1.15, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.restore();
        }

        // Celestial Core
        ctx.beginPath();
        ctx.arc(0, 0, curSize * 0.36, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const render = () => {
      time += 16;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      const intensityMult = starIntensityRef.current;
      const isMidnight = atmosphereRef.current === 'midnight';
      const mouse = mousePosRef.current;

      // Gentle natural meadow wind sway
      const wind = Math.sin(time * 0.0009) * 12;

      // 1. Draw Deep Cosmic Twinkling Star-Field
      const stars = starsRef.current;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        const t1 = Math.sin(time * star.twinkleSpeed + star.phase);
        const t2 = Math.cos(time * star.secondarySpeed + star.phase * 1.6);
        const compoundFactor = 0.5 + 0.36 * t1 + 0.14 * t2;

        const sx = star.x * width;
        const sy = star.y * height;

        const currentAlpha = Math.max(
          0.06,
          Math.min(1.0, star.baseAlpha * (0.35 + 0.95 * compoundFactor) * intensityMult)
        );

        ctx.beginPath();
        ctx.arc(
          sx,
          sy,
          star.radius * (isMidnight ? 1.15 : 1.0),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();

        // Cosmic sparklers with soft diffraction rays at peak twinkle
        const spikeThreshold = isMidnight ? 0.65 : 0.72;
        if (star.hasGlow && compoundFactor > spikeThreshold) {
          const spikeAlpha = Math.min(1.0, (compoundFactor - spikeThreshold) * 3.5 * currentAlpha);
          const spk = star.spikeLength * (0.7 + compoundFactor * 0.5) * (isMidnight ? 1.3 : 1.0);

          ctx.strokeStyle = star.color;
          ctx.globalAlpha = Math.min(0.95, spikeAlpha);
          ctx.lineWidth = 0.85;

          ctx.beginPath();
          ctx.moveTo(sx - spk, sy);
          ctx.lineTo(sx + spk, sy);
          ctx.moveTo(sx, sy - spk);
          ctx.lineTo(sx, sy + spk);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(sx, sy, star.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = spikeAlpha * 0.38;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // 2. Update and Draw Background Wildflowers (With interactive cursor leaning!)
      const flowers = flowersRef.current;
      for (let i = 0; i < flowers.length; i++) {
        const f = flowers[i];

        // Animate stem growth smoothly
        if (f.currentHeight < f.targetHeight) {
          f.currentHeight += (f.targetHeight - f.currentHeight) * 0.06 + 2;
          if (f.currentHeight > f.targetHeight) f.currentHeight = f.targetHeight;
        }

        // Bloom flower head
        if (f.currentHeight >= f.targetHeight * 0.85 && f.bloomProgress < 1) {
          f.bloomProgress = Math.min(1, f.bloomProgress + 0.035);
        }

        if (f.isRare) {
          f.rareAuraPulse = (f.rareAuraPulse || 0) + 0.045;
        }

        const baseX = f.x * width;
        const baseY = height;
        const naturalSway = Math.sin(time * f.swaySpeed + f.swayOffset) * 8 + (wind * (f.currentHeight / height));

        // Interactive Cursor Lean & Tilt:
        // Flowers subtly lean toward or follow the user's cursor as it moves across the screen
        let targetLean = 0;
        let targetTilt = 0;
        if (mouse.active) {
          const approxTipX = baseX + f.curveFactor + naturalSway;
          const approxTipY = baseY - f.currentHeight;
          const dx = mouse.x - approxTipX;
          const dy = mouse.y - approxTipY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const reachRadius = 360;
          if (dist < reachRadius) {
            const proximity = Math.pow(1 - dist / reachRadius, 1.25);
            const heightFactor = Math.min(1.2, Math.max(0.45, f.currentHeight / 240));
            // Subtle organic pull toward cursor (up to ~26px)
            targetLean = (dx / (dist + 1)) * 26 * proximity * heightFactor;
            // Subtle blossom head tilt turning toward the cursor angle
            targetTilt = (dx / (dist + 1)) * 0.28 * proximity;
          }
        }

        // Smooth spring-like lerp for responsive, silky follow motion
        const lerpSpeed = 0.082 + (f.swaySpeed * 8);
        f.interactiveLean += (targetLean - f.interactiveLean) * lerpSpeed;
        f.interactiveTilt += (targetTilt - f.interactiveTilt) * lerpSpeed;

        const totalSway = naturalSway + f.interactiveLean;
        const tipX = baseX + f.curveFactor + totalSway;
        const tipY = baseY - f.currentHeight;

        // Draw slender green stem with graceful natural curve responding to wind & cursor
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        const cpX = baseX + (f.curveFactor * 0.4) + (totalSway * 0.45);
        const cpY = baseY - (f.currentHeight * 0.55);
        ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
        ctx.strokeStyle = f.isRare ? '#156142' : '#1a5638';
        ctx.lineWidth = f.isRare ? 3.0 : 2.4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw leaf pairs along stem
        for (let l = 0; l < f.leaves.length; l++) {
          const leaf = f.leaves[l];
          const leafY = baseY - f.currentHeight * leaf.relY;
          if (leafY > tipY) {
            const leafX = baseX + (f.curveFactor * leaf.relY) + (totalSway * leaf.relY);
            ctx.save();
            ctx.translate(leafX, leafY);
            ctx.rotate(leaf.side * 0.42);
            if (f.scale !== undefined && f.scale !== 1.0) {
              ctx.scale(f.scale, f.scale);
            }
            ctx.beginPath();
            ctx.ellipse(leaf.side * (leaf.length / 2), 0, leaf.length / 2, 3.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = f.isRare ? '#278058' : '#226b47';
            ctx.fill();
            ctx.restore();
          }
        }

        // Draw Blossom Head (Standard or Rare Glowing Flower)
        if (f.bloomProgress > 0.05) {
          ctx.save();
          ctx.translate(tipX, tipY);
          const totalRotation = (f.rotation || 0) + (f.interactiveTilt || 0);
          if (totalRotation !== 0) {
            ctx.rotate(totalRotation);
          }
          if (f.scale !== undefined && f.scale !== 1.0) {
            ctx.scale(f.scale, f.scale);
          }
          const currentSize = f.size * f.bloomProgress;

          if (f.isRare && f.rareType) {
            drawRareFlower(f.rareType, f.size, f.bloomProgress, f.rareAuraPulse || 0);
          } else if (f.type === 'daisy') {
            const petals = 12;
            ctx.fillStyle = f.petalColor;
            for (let p = 0; p < petals; p++) {
              ctx.save();
              ctx.rotate((p * Math.PI * 2) / petals);
              ctx.beginPath();
              ctx.ellipse(0, -currentSize * 0.85, currentSize * 0.28, currentSize * 0.65, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
            ctx.beginPath();
            ctx.arc(0, 0, currentSize * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = f.centerColor;
            ctx.fill();
          } else if (f.type === 'sunflower') {
            const petals = 14;
            ctx.fillStyle = f.petalColor;
            for (let p = 0; p < petals; p++) {
              ctx.save();
              ctx.rotate((p * Math.PI * 2) / petals);
              ctx.beginPath();
              ctx.ellipse(0, -currentSize * 0.9, currentSize * 0.3, currentSize * 0.72, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
            ctx.beginPath();
            ctx.arc(0, 0, currentSize * 0.55, 0, Math.PI * 2);
            ctx.fillStyle = f.centerColor;
            ctx.fill();
          } else if (f.type === 'poppy') {
            const petals = 5;
            ctx.fillStyle = f.petalColor;
            for (let p = 0; p < petals; p++) {
              ctx.save();
              ctx.rotate((p * Math.PI * 2) / petals);
              ctx.beginPath();
              ctx.ellipse(0, -currentSize * 0.7, currentSize * 0.65, currentSize * 0.65, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
            ctx.beginPath();
            ctx.arc(0, 0, currentSize * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = f.centerColor;
            ctx.fill();
          } else if (f.type === 'lavender') {
            ctx.fillStyle = f.petalColor;
            for (let b = 0; b < 6; b++) {
              const by = -b * (currentSize * 0.45);
              ctx.beginPath();
              ctx.arc(-currentSize * 0.3, by, currentSize * 0.28, 0, Math.PI * 2);
              ctx.arc(currentSize * 0.3, by, currentSize * 0.28, 0, Math.PI * 2);
              ctx.arc(0, by - 2, currentSize * 0.25, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            const petals = 6;
            ctx.fillStyle = f.petalColor;
            for (let p = 0; p < petals; p++) {
              ctx.save();
              ctx.rotate((p * Math.PI * 2) / petals);
              ctx.beginPath();
              ctx.ellipse(0, -currentSize * 0.75, currentSize * 0.45, currentSize * 0.6, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
            ctx.beginPath();
            ctx.arc(0, 0, currentSize * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = f.centerColor;
            ctx.fill();
          }

          ctx.restore();
        }
      }

      // 3. Update and Draw Hero Singular Towering Majestic Red Rose
      const rose = heroRoseRef.current;
      rose.baseX = width * 0.5;
      rose.baseY = height;

      const targetRoseTipY = Math.max(140, height * 0.38);
      rose.targetHeight = height - targetRoseTipY;
      rose.size = Math.max(62, Math.min(width * 0.08, 76));

      if (rose.currentHeight < rose.targetHeight) {
        rose.currentHeight += (rose.targetHeight - rose.currentHeight) * 0.05 + 2.5;
        if (rose.currentHeight > rose.targetHeight) rose.currentHeight = rose.targetHeight;
      }

      if (rose.bloomProgress < 1.0) {
        rose.bloomProgress += (1.0 - rose.bloomProgress) * 0.035;
        if (rose.bloomProgress > 0.999) rose.bloomProgress = 1.0;
      }

      if (rose.pulseScale > 1.0) {
        rose.pulseScale += (1.0 - rose.pulseScale) * 0.085;
      }

      // Rose interactive cursor lean & follow
      let targetRoseLean = 0;
      if (mouse.active) {
        const roseDx = mouse.x - rose.tipX;
        const roseDy = mouse.y - rose.tipY;
        const rDist = Math.sqrt(roseDx * roseDx + roseDy * roseDy);
        if (rDist < 440) {
          const rProx = Math.pow(1 - rDist / 440, 1.15);
          targetRoseLean = (roseDx / (rDist + 1)) * 20 * rProx;
        }
      }
      rose.interactiveLean += (targetRoseLean - rose.interactiveLean) * 0.065;

      const roseNaturalSway = Math.sin(time * 0.0009) * 8 + (wind * (rose.currentHeight / height));
      rose.sway = roseNaturalSway + rose.interactiveLean;
      rose.tipX = rose.baseX + rose.sway;
      rose.tipY = rose.baseY - rose.currentHeight;

      const stemCpX = rose.baseX + (rose.sway * 0.44);
      const stemCpY = rose.baseY - (rose.currentHeight * 0.54);

      // Main Rose Stem
      ctx.beginPath();
      ctx.moveTo(rose.baseX, rose.baseY);
      ctx.quadraticCurveTo(stemCpX, stemCpY, rose.tipX, rose.tipY + 12);
      ctx.strokeStyle = '#113a21';
      ctx.lineWidth = 6.8;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rose.baseX, rose.baseY);
      ctx.quadraticCurveTo(stemCpX, stemCpY, rose.tipX, rose.tipY + 12);
      ctx.strokeStyle = '#227244';
      ctx.lineWidth = 4.8;
      ctx.stroke();

      // Cartoon thorns along stem
      const thornPcts = [0.24, 0.42, 0.58, 0.78];
      for (let t = 0; t < thornPcts.length; t++) {
        const tr = thornPcts[t];
        const thY = rose.baseY - rose.currentHeight * tr;
        const thX = rose.baseX + (rose.sway * tr);
        const tSide = t % 2 === 0 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(thX, thY);
        ctx.quadraticCurveTo(thX + tSide * 8, thY - 2, thX + tSide * 10, thY + 5);
        ctx.quadraticCurveTo(thX + tSide * 3, thY + 4, thX, thY + 5);
        ctx.fillStyle = '#113a21';
        ctx.fill();
      }

      // Fanning leaves
      const leafClusterY = rose.baseY - rose.currentHeight * 0.65;
      const leafClusterX = rose.baseX + (rose.sway * 0.65);

      drawDistinctiveRoseLeaf(leafClusterX - 3, leafClusterY, -Math.PI * 0.36, 42, 16);
      drawDistinctiveRoseLeaf(leafClusterX - 4, leafClusterY + 8, -Math.PI * 0.55, 48, 18);
      drawDistinctiveRoseLeaf(leafClusterX - 3, leafClusterY + 18, -Math.PI * 0.72, 38, 15);

      drawDistinctiveRoseLeaf(leafClusterX + 3, leafClusterY, Math.PI * 0.36, 42, 16);
      drawDistinctiveRoseLeaf(leafClusterX + 4, leafClusterY + 8, Math.PI * 0.55, 48, 18);
      drawDistinctiveRoseLeaf(leafClusterX + 3, leafClusterY + 18, Math.PI * 0.72, 38, 15);

      const lowerLeafY = rose.baseY - rose.currentHeight * 0.34;
      const lowerLeafX = rose.baseX + (rose.sway * 0.34);
      drawDistinctiveRoseLeaf(lowerLeafX - 3, lowerLeafY, -Math.PI * 0.48, 34, 13);
      drawDistinctiveRoseLeaf(lowerLeafX + 3, lowerLeafY - 4, Math.PI * 0.48, 34, 13);

      // Ambient halo fireflies hovering softly around the rose head
      for (let h = 0; h < 9; h++) {
        const hAngle = (h * Math.PI * 2) / 9 + (time * 0.0004);
        const hDist = rose.size * 1.1 + Math.sin(time * 0.002 + h) * 12;
        const hx = rose.tipX + Math.cos(hAngle) * hDist;
        const hy = rose.tipY + Math.sin(hAngle) * (hDist * 0.85);

        ctx.beginPath();
        ctx.arc(hx, hy, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = isMidnight ? 'rgba(167, 243, 208, 0.95)' : 'rgba(255, 230, 140, 0.9)';
        ctx.shadowColor = isMidnight ? 'rgba(56, 189, 248, 0.85)' : 'rgba(255, 200, 80, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw the Towering Crimson Red Rose Blossom Head
      if (rose.currentHeight > 40) {
        drawMajesticRoseHead(
          rose.tipX,
          rose.tipY,
          rose.size,
          rose.bloomProgress,
          rose.pulseScale
        );
      }

      // 4. Update and Draw Romantic Floating Hearts (Slowly rising from meadow to sky)
      const hearts = floatingHeartsRef.current;
      for (let i = 0; i < hearts.length; i++) {
        const ht = hearts[i];
        ht.y -= ht.vy;

        // Reset heart when it reaches top of screen
        if (ht.y < -30) {
          ht.y = height + 10 + Math.random() * 40;
          ht.x = Math.random() * width;
          ht.vy = 0.35 + Math.random() * 0.65;
          ht.size = 9 + Math.random() * 14;
        }

        // Horizontal sinusoidal sway
        const hSway = Math.sin(time * ht.swaySpeed + ht.swayOffset) * ht.swayAmp;
        const renderX = ht.x + hSway;

        // Fade in near meadow, stay visible throughout flight, fade out near top
        let alpha = ht.baseAlpha;
        if (ht.y > height - 80) {
          alpha *= Math.max(0, (height - ht.y) / 80);
        } else if (ht.y < 120) {
          alpha *= Math.max(0, ht.y / 120);
        }

        drawHeart(renderX, ht.y, ht.size, ht.rotation, ht.colorPrefix, alpha);
      }

      // 5. Update and Draw Firefly System
      const fireflies = firefliesRef.current;

      for (let i = 0; i < fireflies.length; i++) {
        const ff = fireflies[i];

        ff.heading +=
          Math.sin(time * 0.0013 + ff.wanderSeed) * ff.turnRate +
          Math.cos(time * 0.0027 + ff.wanderSeed * 1.5) * (ff.turnRate * 0.6);

        const vx = Math.cos(ff.heading) * ff.speed + (wind * 0.000035);
        const vy = Math.sin(ff.heading) * ff.speed - 0.000035;

        ff.x += vx;
        ff.y += vy;

        if (ff.x < -0.05) ff.x = 1.05;
        if (ff.x > 1.05) ff.x = -0.05;
        if (ff.y < 0.08) ff.y = 0.88;
        if (ff.y > 0.92) ff.y = 0.15;

        ff.blinkTimer += 16;
        if (!ff.isBlinking && ff.blinkTimer > ff.blinkInterval) {
          ff.isBlinking = true;
          ff.blinkProgress = 0;
        }

        let currentAlpha = ff.baseAlpha;
        let currentGlow = ff.glowRadius;
        let currentRadius = ff.radius;

        if (ff.isBlinking) {
          ff.blinkProgress += 16 / ff.blinkDuration;
          if (ff.blinkProgress >= 1.0) {
            ff.isBlinking = false;
            ff.blinkProgress = 0;
            ff.blinkTimer = 0;
            ff.blinkInterval = 2600 + Math.random() * 5400;
          } else {
            const blinkFlare = Math.sin(ff.blinkProgress * Math.PI);
            currentAlpha = Math.min(1.0, ff.baseAlpha + (1.0 - ff.baseAlpha) * Math.pow(blinkFlare, 1.2));
            currentGlow = ff.glowRadius + blinkFlare * 18;
            currentRadius = ff.radius + blinkFlare * 1.3;
          }
        } else {
          const idleShimmer = 0.85 + 0.15 * Math.sin(time * 0.0032 + ff.wanderSeed);
          currentAlpha = ff.baseAlpha * idleShimmer;
        }

        const fx = ff.x * width;
        const fy = ff.y * height;

        const finalAlpha = currentAlpha;
        const finalGlow = currentGlow;
        const finalRadius = currentRadius;

        ctx.beginPath();
        ctx.arc(fx, fy, finalGlow, 0, Math.PI * 2);
        ctx.fillStyle = `${ff.haloColor} ${(finalAlpha * 0.32).toFixed(3)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(fx, fy, finalGlow * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = `${ff.haloColor} ${(finalAlpha * 0.72).toFixed(3)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(fx, fy, finalRadius, 0, Math.PI * 2);
        ctx.fillStyle = ff.color;
        ctx.shadowColor = ff.color;
        ctx.shadowBlur = finalGlow * 0.85;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 6. Visual Feedback Rings (Planting)
      const rings = feedbackRingsRef.current;
      for (let r = rings.length - 1; r >= 0; r--) {
        const ring = rings[r];
        ring.radius += (ring.maxRadius - ring.radius) * 0.09 + 0.6;
        ring.alpha -= ring.decay;

        if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
          rings.splice(r, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${ring.color} ${Math.max(0, ring.alpha).toFixed(2)})`;
        ctx.lineWidth = ring.lineWidth * (ring.alpha / 0.95);
        ctx.stroke();

        ctx.fillStyle = `${ring.color} ${(ring.alpha * 0.08).toFixed(2)})`;
        ctx.fill();
        ctx.restore();
      }

      // Botanical Dust Motes
      const dust = dustMotesRef.current;
      for (let d = dust.length - 1; d >= 0; d--) {
        const mote = dust[d];
        mote.x += mote.vx;
        mote.y += mote.vy;
        mote.vx *= 0.93;
        mote.vy *= 0.93;
        mote.vy -= 0.035;
        mote.alpha -= mote.decay;

        if (mote.alpha <= 0) {
          dust.splice(d, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
        ctx.fillStyle = mote.color;
        ctx.globalAlpha = Math.max(0, mote.alpha);
        ctx.shadowColor = mote.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      // Star Sparkles
      const sparkles = sparklesRef.current;
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const p = sparkles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.alpha -= p.life;
        p.rotation += p.rotSpeed;

        if (p.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        const r = p.size;
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.3, -r * 0.3);
        ctx.lineTo(r, 0);
        ctx.lineTo(r * 0.3, r * 0.3);
        ctx.lineTo(0, r);
        ctx.lineTo(-r * 0.3, r * 0.3);
        ctx.lineTo(-r, 0);
        ctx.lineTo(-r * 0.3, -r * 0.3);
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onWindowPointerMove);
      document.removeEventListener('mouseleave', onWindowPointerLeave);
    };
  }, []);

  return (
    <canvas
      id="meadow-living-canvas"
      ref={canvasRef}
      onClick={handleCanvasClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`absolute inset-0 w-full h-full block select-none ${
        interactive ? 'cursor-pointer' : ''
      }`}
    />
  );
};

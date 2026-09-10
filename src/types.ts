export type VisualThemeKey = 'midnight' | 'morning' | 'vintage' | 'enchanted';

export type SkyAtmosphere = 'sunset' | 'midnight';
export type SkyMode = 'sunset' | 'midnight' | 'auto';

export type RareFlowerType = 'crystal_orchid' | 'star_lotus' | 'golden_celestial';

export interface VisualTheme {
  id: VisualThemeKey;
  name: string;
  badgeLabel: string;
  colors: {
    bgGradient: string; // CSS gradient for sky/background
    horizonGlow: string; // warm horizon glow color
    cardBg: string; // card background
    cardBorder: string; // card border
    accentText: string; // gold / peach / mint accent text
    primaryPetal: string; // main flower petal gradient start
    secondaryPetal: string; // main flower petal gradient end
    accentPetal: string; // center / stamen highlight
    swatchColors: [string, string, string]; // 3 preview colors for theme selector
  };
}

export interface LetterData {
  to: string;
  from: string;
  occasion: string;
  message: string;
  theme: VisualThemeKey;
}

export type BloomStage = 0 | 1 | 2 | 3 | 4 | 5;
// 0: Intro with unbloomed bud & "TOUCH TO BLOOM 🌸"
// 1: First unfolding & "one more reason I love you 💫"
// 2: Multi-layer bloom & "your smile is my favorite flower 🌼"
// 3: Stems sprouting up & "you make everything bloom brighter ✨"
// 4: Full wildflower meadow blossoming
// 5: Letter card revealed with bottom controls

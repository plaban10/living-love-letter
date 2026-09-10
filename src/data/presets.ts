import { VisualTheme, VisualThemeKey, LetterData, SkyAtmosphere } from '../types';

export const SKY_ATMOSPHERES: Record<SkyAtmosphere, {
  bgGradient: string;
  horizonGlow: string;
  label: string;
  icon: string;
  starIntensity: number;
}> = {
  sunset: {
    bgGradient: 'linear-gradient(180deg, #131224 0%, #1a1532 25%, #38192c 50%, #631d33 72%, #8c283c 88%, #a43245 100%)',
    horizonGlow: 'radial-gradient(ellipse at 50% 92%, rgba(230, 60, 85, 0.52) 0%, rgba(160, 35, 60, 0.28) 45%, rgba(20, 15, 30, 0) 78%)',
    label: 'Sunset Glow',
    icon: '🌅',
    starIntensity: 0.85,
  },
  midnight: {
    bgGradient: 'linear-gradient(180deg, #030612 0%, #071026 22%, #0d1a3c 45%, #122452 68%, #162c64 85%, #1b3476 100%)',
    horizonGlow: 'radial-gradient(ellipse at 50% 92%, rgba(55, 125, 245, 0.48) 0%, rgba(30, 75, 175, 0.26) 45%, rgba(5, 10, 26, 0) 78%)',
    label: 'Midnight Blue',
    icon: '🌌',
    starIntensity: 1.5,
  },
};

export const THEMES: Record<VisualThemeKey, VisualTheme> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    badgeLabel: 'Midnight Glow',
    colors: {
      bgGradient: 'linear-gradient(180deg, #131224 0%, #1a1532 25%, #38192c 50%, #631d33 72%, #8c283c 88%, #a43245 100%)',
      horizonGlow: 'radial-gradient(ellipse at 50% 92%, rgba(230, 60, 85, 0.48) 0%, rgba(160, 35, 60, 0.25) 45%, rgba(20, 15, 30, 0) 78%)',
      cardBg: 'rgba(16, 18, 36, 0.88)',
      cardBorder: 'rgba(235, 192, 130, 0.25)',
      accentText: '#ebd49d',
      primaryPetal: '#ff2e78',
      secondaryPetal: '#ff9ebb',
      accentPetal: '#ffd479',
      swatchColors: ['#14162e', '#ff3377', '#ebd49d'],
    },
  },
  morning: {
    id: 'morning',
    name: 'Morning',
    badgeLabel: 'Dawn Blossom',
    colors: {
      bgGradient: 'linear-gradient(180deg, #182038 0%, #332742 45%, #6a3d4f 75%, #a85856 100%)',
      horizonGlow: 'radial-gradient(ellipse at 50% 65%, rgba(247, 143, 111, 0.35) 0%, rgba(40, 25, 45, 0) 70%)',
      cardBg: 'rgba(28, 24, 38, 0.88)',
      cardBorder: 'rgba(255, 186, 150, 0.3)',
      accentText: '#ffd2ba',
      primaryPetal: '#ff7052',
      secondaryPetal: '#ffb396',
      accentPetal: '#fff0a8',
      swatchColors: ['#282640', '#ff7854', '#ffd2ba'],
    },
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage',
    badgeLabel: 'Antique Rose',
    colors: {
      bgGradient: 'linear-gradient(180deg, #140d12 0%, #26141c 45%, #421c27 75%, #56202c 100%)',
      horizonGlow: 'radial-gradient(ellipse at 50% 65%, rgba(189, 44, 76, 0.32) 0%, rgba(30, 15, 22, 0) 70%)',
      cardBg: 'rgba(26, 16, 22, 0.90)',
      cardBorder: 'rgba(238, 198, 165, 0.25)',
      accentText: '#eedcc9',
      primaryPetal: '#c92a4e',
      secondaryPetal: '#e88295',
      accentPetal: '#f5d59f',
      swatchColors: ['#22121b', '#c92a4e', '#eedcc9'],
    },
  },
  enchanted: {
    id: 'enchanted',
    name: 'Enchanted',
    badgeLabel: 'Forest Dream',
    colors: {
      bgGradient: 'linear-gradient(180deg, #071516 0%, #0d2727 45%, #133a37 75%, #184b42 100%)',
      horizonGlow: 'radial-gradient(ellipse at 50% 65%, rgba(54, 199, 168, 0.25) 0%, rgba(10, 35, 30, 0) 70%)',
      cardBg: 'rgba(10, 26, 26, 0.90)',
      cardBorder: 'rgba(122, 222, 198, 0.28)',
      accentText: '#9eedd8',
      primaryPetal: '#20b898',
      secondaryPetal: '#72f0d4',
      accentPetal: '#ffeb8a',
      swatchColors: ['#0d2727', '#20b898', '#9eedd8'],
    },
  },
};

export const DEFAULT_LETTER: LetterData = {
  to: 'Bubu',
  from: 'Dudu',
  occasion: 'just because',
  message: "I couldn't give you flowers|that last forever,|so I grew you a meadow|that never wilts.",
  theme: 'midnight',
};

export const OCCASION_PRESETS: Array<{ label: string; text: string; message: string }> = [
  {
    label: 'Just because',
    text: 'just because',
    message: "I couldn't give you flowers|that last forever,|so I grew you a meadow|that never wilts.",
  },
  {
    label: 'Thinking of you',
    text: 'thinking of you',
    message: 'Every time I think of you,|a flower blooms in my heart.|Now there is an entire meadow.',
  },
  {
    label: 'Roses for you',
    text: 'roses for you',
    message: 'A thousand petals for a thousand smiles,|each one planted just for you.',
  },
  {
    label: 'Long distance',
    text: 'across the miles',
    message: 'No distance can keep this meadow from blooming,|just like nothing can dim my love for you.',
  },
  {
    label: 'Anniversary',
    text: 'happy anniversary',
    message: 'Another year of watching our love grow,|more vibrant and gentle with every season.',
  },
  {
    label: 'Good morning',
    text: 'good morning sunshine',
    message: 'May your day bloom as softly and brightly|as this enchanted garden.',
  },
  {
    label: 'Birthday',
    text: 'happy birthday',
    message: 'Wishing you a year filled with sweet blossoms,|endless sunshine, and all your dreams in bloom.',
  },
  {
    label: 'Valentine’s',
    text: 'my eternal valentine',
    message: 'You are the gentle rain and warm sunlight|that makes my whole world blossom.',
  },
];

export const STAGE_BUTTON_TEXTS: Record<number, { text: string; icon: string }> = {
  0: { text: 'OPEN MY LOVE LETTER', icon: '💌' },
  1: { text: 'OPEN MY LOVE LETTER', icon: '💌' },
  2: { text: 'OPEN MY LOVE LETTER', icon: '💌' },
  3: { text: 'OPEN MY LOVE LETTER', icon: '💌' },
  4: { text: 'OPEN MY LOVE LETTER', icon: '💌' },
};

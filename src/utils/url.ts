import { LetterData, VisualThemeKey } from '../types';
import { DEFAULT_LETTER } from '../data/presets';

export function getLetterFromUrl(): LetterData {
  if (typeof window === 'undefined') return DEFAULT_LETTER;

  try {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to') || params.get('recipient');
    const from = params.get('from') || params.get('sender');
    const occasion = params.get('occ') || params.get('occasion');
    const message = params.get('msg') || params.get('message');
    const theme = (params.get('theme') || params.get('th')) as VisualThemeKey;

    if (to || from || message) {
      return {
        to: to ? decodeURIComponent(to) : DEFAULT_LETTER.to,
        from: from ? decodeURIComponent(from) : DEFAULT_LETTER.from,
        occasion: occasion ? decodeURIComponent(occasion) : DEFAULT_LETTER.occasion,
        message: message ? decodeURIComponent(message) : DEFAULT_LETTER.message,
        theme: (theme && ['midnight', 'morning', 'vintage', 'enchanted'].includes(theme))
          ? theme
          : DEFAULT_LETTER.theme,
      };
    }
  } catch {
    // fallback
  }

  return DEFAULT_LETTER;
}

export function generateShareUrl(letter: LetterData): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('to', letter.to);
  url.searchParams.set('from', letter.from);
  url.searchParams.set('occ', letter.occasion);
  url.searchParams.set('msg', letter.message);
  url.searchParams.set('theme', letter.theme);
  return url.toString();
}

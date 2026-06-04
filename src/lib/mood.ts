export const MOOD_MIN = 1;
export const MOOD_MAX = 10;

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Red (1) → amber → green (10). Single source of truth for mood colors. */
export function moodColor(value: number): string {
  const v = Math.min(MOOD_MAX, Math.max(MOOD_MIN, value));
  const t = (v - MOOD_MIN) / (MOOD_MAX - MOOD_MIN);
  return hslToHex(120 * t, 70, 44);
}

export function moodLabel(value: number): string {
  if (value <= 2) return 'Very bad';
  if (value <= 4) return 'Bad';
  if (value <= 6) return 'Okay';
  if (value <= 8) return 'Good';
  return 'Great';
}

export const MOOD_VALUES: number[] = Array.from(
  { length: MOOD_MAX - MOOD_MIN + 1 },
  (_, i) => MOOD_MIN + i,
);

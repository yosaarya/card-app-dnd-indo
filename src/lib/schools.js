/** Warna aksen per school sihir, dipakai untuk badge dan garis tepi kartu. */
const SCHOOL_ACCENTS = {
  Abjuration: '#60a5fa',
  Conjuration: '#fb923c',
  Divination: '#38bdf8',
  Enchantment: '#f472b6',
  Evocation: '#f87171',
  Illusion: '#c084fc',
  Necromancy: '#34d399',
  Transmutation: '#fbbf24',
};

export const DEFAULT_ACCENT = '#a78bfa';

export function schoolAccent(school) {
  return SCHOOL_ACCENTS[school] ?? DEFAULT_ACCENT;
}

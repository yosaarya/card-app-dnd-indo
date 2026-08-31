/**
 * Utilitas data spell: normalisasi, filter, dan urutan.
 *
 * Data mentah dari dnd5eapi punya beberapa ketidakkonsistenan (mis. "2th Level"
 * bercampur dengan "2nd Level"), jadi semua dinormalisasi sekali di sini
 * supaya komponen tidak perlu tahu soal itu.
 */

export const SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

export const CLASSES = [
  'Bard',
  'Cleric',
  'Druid',
  'Paladin',
  'Ranger',
  'Sorcerer',
  'Warlock',
  'Wizard',
];

const ORDINALS = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

/** Daftar pilihan level untuk dropdown: [{ value: 0..9, label }] */
export const LEVEL_OPTIONS = ORDINALS.map((ordinal, level) => ({
  value: level,
  label: level === 0 ? 'Cantrip' : `${ordinal} Level`,
}));

/** "2th Level" | "Cantrip" | "3rd Level" -> 0..9 */
function parseLevel(levelStr) {
  if (!levelStr) return 0;
  const match = String(levelStr).match(/\d/);
  return match ? Number(match[0]) : 0;
}

/** 0..9 -> "Cantrip" | "2nd Level" */
export function formatLevel(level) {
  return level === 0 ? 'Cantrip' : `${ORDINALS[level]} Level`;
}

/** Label ringkas untuk badge kartu: "Cantrip" | "Lv 2" */
export function shortLevel(level) {
  return level === 0 ? 'Cantrip' : `Lv ${level}`;
}

/**
 * Baris-baris efek yang tampil di kotak kartu, sudah berurut sesuai prioritas
 * baca di meja: damage -> heal -> area -> sisanya.
 */
export function buildEffectLines(cardData = {}) {
  const lines = [];

  for (const dmg of cardData.damage ?? []) {
    lines.push({ tone: 'damage', label: 'Dmg', text: dmg });
  }
  for (const heal of cardData.healing ?? []) {
    lines.push({ tone: 'healing', label: 'Heal', text: heal });
  }
  if (cardData.aoe) {
    lines.push({ tone: 'aoe', label: 'Area', text: cardData.aoe });
  }
  for (const effect of cardData.effects ?? []) {
    lines.push({ tone: 'neutral', text: effect });
  }

  return lines;
}

/** Tag ringkas yang layak dipajang di kartu (concentration, ritual, save, dst). */
export function buildTags(spell) {
  const data = spell.cardData;
  const tags = [];

  if (data.concentration) tags.push({ text: 'Concentration', tone: 'warn' });
  if (data.ritual) tags.push({ text: 'Ritual', tone: 'info' });
  if (data.save) tags.push({ text: `${data.save} Save`, tone: 'danger' });
  if (data.attack_roll) tags.push({ text: 'Attack Roll', tone: 'danger' });
  if (data.material_cost) tags.push({ text: 'Material $', tone: 'info' });

  return tags;
}

/** Menyiapkan satu spell mentah menjadi bentuk yang dipakai UI. */
function normalizeSpell(raw) {
  const level = parseLevel(raw.level);
  const classes = Array.isArray(raw.class) ? raw.class : [];
  const cardData = raw.card_data ?? {};
  const effectLines = buildEffectLines(cardData);

  const searchIndex = [
    raw.name,
    raw.school,
    cardData.summary,
    raw.description,
    classes.join(' '),
    effectLines.map((line) => line.text).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return {
    id: raw.id,
    name: raw.name,
    level,
    levelLabel: formatLevel(level),
    school: raw.school ?? 'Unknown',
    classes,
    castingTime: raw.casting_time ?? '—',
    range: raw.range ?? '—',
    components: raw.components ?? '—',
    duration: raw.duration ?? '—',
    description: raw.description ?? '',
    cardData,
    summary: cardData.summary ?? '',
    effectLines,
    searchIndex,
  };
}

export function normalizeSpells(rawList) {
  return rawList.map(normalizeSpell);
}

export const SORTS = {
  name: { label: 'Nama (A–Z)', compare: (a, b) => a.name.localeCompare(b.name) },
  level: {
    label: 'Level (rendah–tinggi)',
    compare: (a, b) => a.level - b.level || a.name.localeCompare(b.name),
  },
  levelDesc: {
    label: 'Level (tinggi–rendah)',
    compare: (a, b) => b.level - a.level || a.name.localeCompare(b.name),
  },
  school: {
    label: 'School',
    compare: (a, b) => a.school.localeCompare(b.school) || a.name.localeCompare(b.name),
  },
};

/** Menyaring lalu mengurutkan daftar spell sesuai state filter. */
export function filterSpells(spells, { query, school, level, klass, sort }) {
  const needle = query.trim().toLowerCase();

  const result = spells.filter((spell) => {
    if (needle && !spell.searchIndex.includes(needle)) return false;
    if (school !== 'All' && spell.school !== school) return false;
    if (level !== 'All' && spell.level !== Number(level)) return false;
    if (klass !== 'All' && !spell.classes.includes(klass)) return false;
    return true;
  });

  const compare = (SORTS[sort] ?? SORTS.name).compare;

  if (!needle) return result.sort(compare);

  // Pencarian menjangkau deskripsi resmi juga, jadi mencari "fireball" bisa
  // memunculkan spell lain yang menyebut Fireball. Cocok-nama didahulukan
  // supaya spell yang benar-benar dicari selalu berada di baris pertama.
  const rank = (spell) => (spell.name.toLowerCase().startsWith(needle) ? 0 : spell.name.toLowerCase().includes(needle) ? 1 : 2);

  return result.sort((a, b) => rank(a) - rank(b) || compare(a, b));
}

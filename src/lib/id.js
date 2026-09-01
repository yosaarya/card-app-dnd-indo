/**
 * Pengalihbahasaan istilah D&D ke bahasa Indonesia.
 *
 * Data SRD memakai kosakata tertutup yang kecil (9 casting time, 20 durasi,
 * 17 range, 6 kombinasi komponen), jadi semuanya diterjemahkan penuh di sini
 * alih-alih ditebak dengan regex.
 *
 * Nama school dan class sengaja dibiarkan dalam bahasa Inggris pada kartu:
 * itulah yang tertulis di lembar karakter dan buku aturan pemain. Padanan
 * Indonesianya disediakan sebagai keterangan di dalam aplikasi.
 */

const CASTING_TIME = {
  '1 action': '1 aksi',
  '1 bonus action': '1 aksi bonus',
  '1 reaction': '1 reaksi',
  '1 minute': '1 menit',
  '10 minutes': '10 menit',
  '1 hour': '1 jam',
  '8 hours': '8 jam',
  '12 hours': '12 jam',
  '24 hours': '24 jam',
};

const DURATION = {
  Instantaneous: 'Seketika',
  Special: 'Khusus',
  'Until dispelled': 'Sampai dibubarkan',
  '1 round': '1 ronde',
  '1 minute': '1 menit',
  '10 minutes': '10 menit',
  '1 hour': '1 jam',
  '2 hours': '2 jam',
  '8 hours': '8 jam',
  '24 hours': '24 jam',
  '7 days': '7 hari',
  '10 days': '10 hari',
  '30 days': '30 hari',
};

const RANGE = {
  Self: 'Diri sendiri',
  Touch: 'Sentuhan',
  Sight: 'Sejauh terlihat',
  Special: 'Khusus',
  Unlimited: 'Tak terbatas',
};

const COMPONENT = {
  V: 'Ucap',
  S: 'Gerak',
  M: 'Bahan',
};

const COMPONENT_LONG = {
  V: 'Verbal — mengucapkan mantra dengan suara jelas',
  S: 'Somatic — gerakan tangan, butuh satu tangan bebas',
  M: 'Material — memegang bahan atau focus sihir',
};

export const SCHOOL_ID = {
  Abjuration: { name: 'Abjurasi', gloss: 'sihir pelindung dan penangkal' },
  Conjuration: { name: 'Konjurasi', gloss: 'memanggil benda, makhluk, atau memindahkan' },
  Divination: { name: 'Divinasi', gloss: 'mengungkap informasi yang tersembunyi' },
  Enchantment: { name: 'Pemikatan', gloss: 'memengaruhi pikiran dan kehendak' },
  Evocation: { name: 'Evokasi', gloss: 'ledakan energi, biasanya untuk melukai' },
  Illusion: { name: 'Ilusi', gloss: 'menipu indra dan pikiran' },
  Necromancy: { name: 'Nekromansi', gloss: 'mempermainkan hidup, mati, dan undead' },
  Transmutation: { name: 'Transmutasi', gloss: 'mengubah wujud benda atau makhluk' },
};

export const CLASS_ID = {
  Bard: 'penyihir-pemusik',
  Cleric: 'rohaniwan',
  Druid: 'penjaga alam',
  Paladin: 'ksatria bersumpah',
  Ranger: 'penjelajah rimba',
  Sorcerer: 'sihir bawaan lahir',
  Warlock: 'sihir dari perjanjian',
  Wizard: 'sihir hasil belajar',
};

export const ABILITY_ID = {
  STR: 'Kekuatan (STR)',
  DEX: 'Kelincahan (DEX)',
  CON: 'Ketahanan (CON)',
  INT: 'Kecerdasan (INT)',
  WIS: 'Kebijaksanaan (WIS)',
  CHA: 'Karisma (CHA)',
};

export function castingTimeID(value) {
  return CASTING_TIME[value] ?? value;
}

export function durationID(value) {
  if (!value) return '—';
  if (DURATION[value]) return DURATION[value];

  // "Up to 1 hour" -> "Maks. 1 jam". Data SRD memuat "Up to hour" tanpa angka.
  const upTo = value.match(/^Up to (?:(\d+) )?(round|minute|hour|day)s?$/i);
  if (upTo) {
    const amount = upTo[1] ?? '1';
    const unit = { round: 'ronde', minute: 'menit', hour: 'jam', day: 'hari' }[upTo[2].toLowerCase()];
    return `Maks. ${amount} ${unit}`;
  }

  return value;
}

/** Satu kotak di peta pertempuran = 5 kaki, ukuran yang benar-benar dipakai pemain. */
export function rangeID(value) {
  if (!value) return '—';
  if (RANGE[value]) return RANGE[value];

  const feet = value.match(/^(\d+) feet$/);
  if (feet) {
    const squares = Number(feet[1]) / 5;
    return `${feet[1]} kaki (${squares} kotak)`;
  }

  const miles = value.match(/^(\d+) miles?$/);
  if (miles) return `${miles[1]} mil`;

  return value;
}

/** Versi pendek tanpa jumlah kotak, untuk footer kartu yang sempit. */
export function rangeShortID(value) {
  if (!value) return '—';
  if (RANGE[value]) return RANGE[value];
  return value.replace(/(\d+) feet/, '$1 kaki').replace(/(\d+) miles?/, '$1 mil');
}

function componentLetters(value) {
  return (value ?? '')
    .split(',')
    .map((letter) => letter.trim())
    .filter((letter) => letter in COMPONENT);
}

export function componentsID(value) {
  const letters = componentLetters(value);
  return letters.length ? letters.map((letter) => COMPONENT[letter]).join(' · ') : '—';
}

export function componentsLongID(value) {
  return componentLetters(value).map((letter) => COMPONENT_LONG[letter]);
}

export function hasComponent(value, letter) {
  return componentLetters(value).includes(letter);
}

/* --- damage, penyembuhan, dan area --- */

const DAMAGE_TYPE = {
  Acid: 'Asam',
  Bludgeoning: 'Hantam',
  Bludg: 'Hantam',
  Cold: 'Dingin',
  Fire: 'Api',
  Force: 'Gaya',
  Lightning: 'Petir',
  Necrotic: 'Nekrotik',
  Piercing: 'Tusuk',
  Poison: 'Racun',
  Psychic: 'Psikis',
  Radiant: 'Cahaya',
  Slashing: 'Tebas',
  Thunder: 'Guruh',
};

/** Padanan Inggris untuk daftar istilah, karena stat block monster memakai istilah aslinya. */
export const DAMAGE_TYPE_PAIRS = Object.entries(DAMAGE_TYPE).filter(([en]) => en !== 'Bludg');

const DAMAGE_NOTE = {
  Instant: 'langsung',
  'Next Turn': 'giliran berikutnya',
  Mishap: 'kalau gagal',
  Collapse: 'saat runtuh',
  Enlarge: 'Enlarge',
  Reduce: 'Reduce',
  'Weapon Attack Bonus': 'bonus serangan senjata',
  'If stone partially destroyed': 'jika batunya rusak sebagian',
  Divided: 'dibagi',
  'Max HP Increase': 'menaikkan HP maksimal',
};

const HEALING = {
  '1d8 + Spellcasting Modifier': '1d8 + modifier sihir',
  '1d4 + Spellcasting Modifier': '1d4 + modifier sihir',
  '3d8 + Spellcasting Modifier': '3d8 + modifier sihir',
  'Temporary HP equal to Spellcasting Modifier': 'HP sementara sebanyak modifier sihir',
  '1 HP per berry': '1 HP per buah beri',
  '2d10 HP (Max HP Increase)': '2d10 HP (menaikkan HP maksimal)',
  'Up to 700 HP (Divided)': 'sampai 700 HP (dibagi ke beberapa sasaran)',
  '1 per turn': '1 per giliran',
  '70 HP': '70 HP',
  '2d8': '2d8',
  '4d8 + 15': '4d8 + 15',
  1: '1',
};

const AOE_SHAPE = {
  Radius: 'radius',
  Cube: 'kubus',
  Square: 'persegi',
  Sphere: 'bola',
  Cone: 'kerucut',
  Line: 'garis',
  Cylinder: 'silinder',
  Wall: 'dinding',
  Ring: 'cincin',
  Height: 'tinggi',
  around: 'di sekitar',
  guardian: 'penjaga',
};

/** Mengganti kata utuh saja, supaya "Force" tidak ikut terganti di dalam kata lain. */
function replaceWords(text, dictionary) {
  return Object.entries(dictionary).reduce(
    (result, [from, to]) => result.replace(new RegExp(`\\b${from}\\b`, 'g'), to),
    text,
  );
}

/** "4d4 Acid (Instant)" -> "4d4 Asam (langsung)" */
export function damageID(value) {
  return replaceWords(replaceWords(value, DAMAGE_NOTE), DAMAGE_TYPE).replace(
    /\bper delayed turn\b/g,
    'per giliran tertunda',
  );
}

export function healingID(value) {
  return HEALING[value] ?? replaceWords(value, { 'Spellcasting Modifier': 'modifier sihir' });
}

/** "20 ft Radius" -> "radius 20 kaki" */
export function aoeID(value) {
  if (!value) return '';

  // "sq ft" adalah satuan luas, sedangkan "Square" adalah bentuk area — dua-duanya
  // jadi kata "persegi" dalam bahasa Indonesia. Satuan luas disimpan sebagai
  // penanda sementara supaya tidak ikut dibalik oleh aturan penyusunan bentuk.
  const SATUAN_LUAS = '\uE000';

  let text = value
    .replace(/Radius Sphere/g, 'Radius') // "bola berjari-jari" cukup ditulis radius
    .replace(/(\d[\d,]*) sq ft/g, `$1 ${SATUAN_LUAS}`)
    .replace(/(\d[\d,]*) ft/g, '$1 kaki')
    .replace(/(\d[\d,]*) miles?/g, '$1 mil');

  text = replaceWords(text, AOE_SHAPE);

  // "20 kaki radius" -> "radius 20 kaki", lebih enak dibaca.
  text = text.replace(
    /(\d[\d,]*(?:x\d+)* (?:kaki|mil)) (radius|kubus|persegi|bola|kerucut|garis|silinder|dinding|cincin)/g,
    '$2 $1',
  );

  return text.replace(SATUAN_LUAS, 'kaki persegi');
}

/**
 * Merapikan frasa Inggris umum yang tersisa di catatan efek.
 *
 * Istilah baku D&D (Save, DEX, Charmed, Beast, Disadvantage) sengaja
 * dibiarkan: itulah yang tertulis di lembar karakter dan stat block monster,
 * jadi menerjemahkannya justru menyulitkan pemain saat main. Istilah-istilah
 * itu dijelaskan di glosarium panduan.
 */
const NOTE_PHRASE = [
  [/\bHalf damage\b/gi, 'separuh damage'],
  [/\bon Success\b/gi, 'jika berhasil'],
  [/\bUp to\b/g, 'Sampai'],
  [/\bper turn\b/gi, 'per giliran'],
  [/\bnext turn\b/gi, 'giliran berikutnya'],
  [/\bWalk speed\b/gi, 'kecepatan jalan'],
  [/\bSwim speed\b/gi, 'kecepatan berenang'],
  [/\bFly speed\b/gi, 'kecepatan terbang'],
  [/(\d[\d,]*) ft\b/g, '$1 kaki'],
];

export function noteID(text) {
  return NOTE_PHRASE.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), text);
}

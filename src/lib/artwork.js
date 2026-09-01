/**
 * Bentuk data artwork per spell: berkas gambarnya, posisi tampilnya, dan
 * tata letak kartu yang dipilih.
 *
 * Gambar disimpan utuh dengan rasio aslinya — pemotongan ke bentuk kartu
 * dilakukan saat render. Kalau gambar sudah dipotong sejak diunggah, tidak
 * ada sisa yang bisa digeser dan kontrol posisi jadi tidak ada gunanya.
 */

export const LAYOUTS = {
  frame: { label: 'Bingkai', hint: 'Gambar di jendela sendiri, teks di atas latar solid.' },
  fullart: { label: 'Full-art', hint: 'Gambar memenuhi kartu, teks menumpang di atasnya.' },
};

export const DEFAULT_LAYOUT = 'frame';

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 3;

/** x dan y dalam persen, langsung dipakai sebagai object-position. */
export const DEFAULT_TRANSFORM = { x: 50, y: 50, zoom: 1 };

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function clampTransform({ x, y, zoom } = {}) {
  return {
    x: clamp(Number.isFinite(x) ? x : DEFAULT_TRANSFORM.x, 0, 100),
    y: clamp(Number.isFinite(y) ? y : DEFAULT_TRANSFORM.y, 0, 100),
    zoom: clamp(Number.isFinite(zoom) ? zoom : DEFAULT_TRANSFORM.zoom, ZOOM_MIN, ZOOM_MAX),
  };
}

/**
 * Menerima bentuk lama maupun baru.
 *
 * Versi awal menyimpan data URL sebagai teks biasa. Entri seperti itu sudah
 * terpotong ke rasio kartu sejak diunggah, jadi posisi tengah adalah tampilan
 * yang benar untuknya.
 *
 * @returns {{art: string, x: number, y: number, zoom: number, layout: string|null}|null}
 */
export function normalizeEntry(value) {
  if (typeof value === 'string') {
    return value ? { art: value, ...DEFAULT_TRANSFORM, layout: null } : null;
  }
  if (!value || typeof value !== 'object') return null;

  const art = typeof value.art === 'string' ? value.art : '';
  // hasOwn, bukan operator `in`: 'toString' dan 'constructor' ada di prototype
  // chain sehingga akan lolos sebagai nama tata letak yang sah.
  const layout = Object.hasOwn(LAYOUTS, value.layout ?? '') ? value.layout : null;

  // Kartu boleh memilih tata letak walau belum punya gambar, tapi entri yang
  // tidak membawa keduanya tidak ada gunanya disimpan.
  if (!art && !layout) return null;

  return { art, ...clampTransform(value), layout };
}

/** Gaya CSS untuk memotong gambar sesuai posisi yang dipilih. */
export function artStyle(entry) {
  const { x, y, zoom } = clampTransform(entry);
  return {
    objectPosition: `${x}% ${y}%`,
    // Titik acuan pembesaran mengikuti titik yang sedang dilihat, supaya
    // memperbesar terasa seperti mendekat ke bagian itu.
    transformOrigin: `${x}% ${y}%`,
    transform: zoom === 1 ? undefined : `scale(${zoom})`,
  };
}

/** Tata letak yang dipakai satu kartu: pilihan kartu itu, kalau tidak ada ikut pilihan global. */
export function layoutFor(entry, fallback) {
  return entry?.layout ?? (Object.hasOwn(LAYOUTS, fallback ?? '') ? fallback : DEFAULT_LAYOUT);
}

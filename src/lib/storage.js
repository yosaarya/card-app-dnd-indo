/**
 * Pembungkus localStorage yang tidak pernah melempar error.
 *
 * localStorage bisa gagal karena Safari private mode, cookie diblokir, data
 * rusak, atau kuota penuh (artwork base64 gampang menembus batas ~5 MB).
 * Semua kegagalan dilaporkan lewat nilai balik, bukan exception, supaya
 * aplikasi tidak pernah layar putih hanya gara-gara storage.
 */

import { normalizeEntry } from './artwork';

const STORAGE_KEY = 'dnd_custom_spells';

function getStore() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Membuang entri yang tidak berbentuk benar, apa pun format asalnya. */
function normalizeAll(entries) {
  const result = {};
  for (const [id, value] of entries) {
    const entry = normalizeEntry(value);
    if (id && entry) result[id] = entry;
  }
  return result;
}

/** @returns {Record<string, {art: string, x: number, y: number, zoom: number, layout: string|null}>} */
export function loadArtwork() {
  const store = getStore();
  if (!store) return {};

  try {
    const parsed = JSON.parse(store.getItem(STORAGE_KEY) ?? 'null');
    if (!parsed) return {};

    // Format paling lama menyimpan array [{ id, customArt }].
    if (Array.isArray(parsed)) {
      return normalizeAll(parsed.filter((entry) => entry?.id).map((entry) => [entry.id, entry.customArt]));
    }

    if (typeof parsed === 'object') return normalizeAll(Object.entries(parsed));
    return {};
  } catch {
    // Data rusak: buang daripada membuat aplikasi gagal start.
    try {
      store.removeItem(STORAGE_KEY);
    } catch {
      /* diabaikan */
    }
    return {};
  }
}

/**
 * @returns {{ ok: true } | { ok: false, reason: 'quota' | 'unavailable' }}
 */
export function saveArtwork(artwork) {
  const store = getStore();
  if (!store) return { ok: false, reason: 'unavailable' };

  try {
    store.setItem(STORAGE_KEY, JSON.stringify(artwork));
    return { ok: true };
  } catch (err) {
    const isQuota =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return { ok: false, reason: isQuota ? 'quota' : 'unavailable' };
  }
}

/** Perkiraan pemakaian storage artwork dalam byte. */
export function artworkSize(artwork) {
  return Object.values(artwork).reduce((total, entry) => total + (entry?.art?.length ?? 0), 0);
}

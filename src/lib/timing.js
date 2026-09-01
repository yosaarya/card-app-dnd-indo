/**
 * Ringkasan waktu merapal dan durasi dari data spell.
 *
 * Angkanya dihitung dari datanya sendiri, bukan ditulis tangan, supaya
 * panduan tidak pernah berbeda dari isi aplikasi setelah data diperbarui.
 */

import { castingTimeID } from './id';

/** Merapal selama satu menit atau lebih tidak mungkin dilakukan di tengah pertempuran. */
const DI_LUAR_PERTEMPURAN = /minute|hour/i;

function hitung(daftar, kunci) {
  const peta = new Map();
  for (const item of daftar) {
    const k = kunci(item);
    peta.set(k, (peta.get(k) ?? 0) + 1);
  }
  return peta;
}

/** @returns {{label: string, jumlah: number, diLuarPertempuran: boolean}[]} urut dari terbanyak */
export function ringkasanWaktuMerapal(spells) {
  const peta = hitung(spells, (spell) => spell.castingTime);

  return [...peta.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([nilai, jumlah]) => ({
      label: castingTimeID(nilai),
      jumlah,
      diLuarPertempuran: DI_LUAR_PERTEMPURAN.test(nilai),
    }));
}

/** @returns {{seketika: number, maksimal: number, tetap: number, sampaiDibubarkan: number, khusus: number}} */
export function ringkasanDurasi(spells) {
  const ringkasan = { seketika: 0, maksimal: 0, tetap: 0, sampaiDibubarkan: 0, khusus: 0 };

  for (const spell of spells) {
    const durasi = spell.duration;
    if (durasi === 'Instantaneous') ringkasan.seketika += 1;
    else if (durasi === 'Until dispelled') ringkasan.sampaiDibubarkan += 1;
    else if (durasi === 'Special') ringkasan.khusus += 1;
    else if (durasi?.startsWith('Up to')) ringkasan.maksimal += 1;
    else ringkasan.tetap += 1;
  }

  return ringkasan;
}

export function hitungKonsentrasi(spells) {
  return spells.filter((spell) => spell.cardData.concentration).length;
}

export function hitungRitual(spells) {
  return spells.filter((spell) => spell.cardData.ritual).length;
}

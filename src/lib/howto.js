/**
 * Menyusun langkah "cara pakai" untuk pemain yang baru belajar D&D.
 *
 * Langkah diturunkan dari data spell, bukan ditulis tangan satu per satu, dan
 * hanya memakai aturan dasar SRD yang berlaku untuk semua spell: lemparan
 * serangan sihir, DC saving throw, dan aturan konsentrasi.
 *
 * Ada dua panjang keluaran. Versi 'card' dipangkas agar muat di kartu
 * 63 x 88 mm; versi 'full' menjelaskan rumusnya dan dipakai di dialog detail.
 */

import { castingTimeID, durationID, rangeID, damageID, healingID, aoeID, noteID, hasComponent } from './id';

const ABILITY_NAME = {
  STR: 'Kekuatan',
  DEX: 'Kelincahan',
  CON: 'Ketahanan',
  INT: 'Kecerdasan',
  WIS: 'Kebijaksanaan',
  CHA: 'Karisma',
};

/** Baris efek yang cuma mengulang isi langkah, jadi tidak perlu dicetak dua kali. */
const REDUNDANT_NOTE =
  /^(?:(?:STR|DEX|CON|INT|WIS|CHA) Sav(?:e|ing Throw)\b.*|Spell Attack Roll|Half Damage on Success)$/i;

function castingStep(spell) {
  const needs = [];
  if (hasComponent(spell.components, 'V')) needs.push('ucapkan mantra');
  if (hasComponent(spell.components, 'S')) needs.push('satu tangan bebas');
  if (hasComponent(spell.components, 'M')) {
    needs.push(spell.cardData.material_cost ? 'bahan khusus (habis dipakai)' : 'focus sihir');
  }

  const cost = castingTimeID(spell.castingTime);
  return needs.length ? `Habiskan ${cost}: ${needs.join(', ')}.` : `Habiskan ${cost}.`;
}

function targetStep(spell) {
  const area = aoeID(spell.cardData.aoe);

  if (spell.range === 'Self') {
    return area ? `Efek berpusat pada dirimu, ${area}.` : 'Efeknya berlaku pada dirimu sendiri.';
  }
  if (spell.range === 'Touch') {
    return 'Sentuh satu sasaran.';
  }
  if (area) {
    return `Pilih titik dalam ${rangeID(spell.range)}, kena ${area}.`;
  }
  return `Pilih sasaran dalam ${rangeID(spell.range)}.`;
}

function rollStep(spell, variant) {
  const { attack_roll: attackRoll, save } = spell.cardData;

  if (attackRoll) {
    return variant === 'card'
      ? 'Lempar serangan sihir lawan AC sasaran.'
      : 'Lempar serangan sihir: d20 + modifier sihirmu + bonus proficiency, lawan AC sasaran.';
  }
  if (save) {
    const name = ABILITY_NAME[save] ?? save;
    return variant === 'card'
      ? `Sasaran lempar save ${save} (${name}) lawan DC sihirmu.`
      : `Sasaran lempar save ${save} (${name}) lawan DC sihirmu = 8 + bonus proficiency + modifier sihir.`;
  }
  return 'Tidak ada lemparan dadu — efeknya langsung berlaku.';
}

function resultStep(spell) {
  const { damage, healing, half_damage: halfDamage, attack_roll: attackRoll, save } = spell.cardData;
  const parts = [];

  if (damage?.length) {
    parts.push(`Kena: ${damage.map(damageID).join(', lalu ')}`);
    // Acid Arrow tetap melukai separuh walau meleset, jadi urutannya penting.
    if (attackRoll) parts.push(halfDamage ? 'meleset: separuh damage' : 'meleset: tidak ada efek');
    else if (halfDamage) parts.push('save berhasil: separuh damage');
    else if (save) parts.push('save berhasil: tidak kena');
  }

  if (healing?.length) {
    parts.push(`Pulihkan ${healing.map(healingID).join(' + ')} HP`);
  }

  return parts.length ? `${parts.join('; ')}.` : null;
}

function upkeepStep(spell, variant) {
  const until = durationID(spell.duration).toLowerCase();

  if (spell.cardData.concentration) {
    return variant === 'card'
      ? `Jaga konsentrasi sampai ${until}; kena damage → save CON DC 10.`
      : `Jaga konsentrasi sampai ${until}. Kalau kamu kena damage, lempar save CON dengan DC 10 atau separuh damage yang diterima (ambil yang lebih besar), kalau gagal sihirnya buyar.`;
  }

  if (spell.duration === 'Instantaneous') return null;
  return `Bertahan ${until}.`;
}

/**
 * @param {'card' | 'full'} variant
 * @returns {string[]} langkah berurutan, yang tidak relevan sudah dibuang
 */
export function buildHowTo(spell, variant = 'full') {
  return [
    castingStep(spell),
    targetStep(spell),
    rollStep(spell, variant),
    resultStep(spell),
    upkeepStep(spell, variant),
  ].filter(Boolean);
}

/** Catatan tambahan di luar urutan langkah. */
export function buildNotes(spell) {
  const notes = (spell.cardData.effects ?? [])
    .filter((note) => !REDUNDANT_NOTE.test(note.trim()))
    .map(noteID);

  if (spell.cardData.ritual) {
    notes.unshift('Ritual: bisa dirapal +10 menit tanpa memakai spell slot.');
  }

  return notes;
}

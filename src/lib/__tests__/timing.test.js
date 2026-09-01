import { describe, expect, it } from 'vitest';
import rawSpells from '../../data/spells-card.json';
import { normalizeSpells } from '../spells';
import { ringkasanWaktuMerapal, ringkasanDurasi, hitungKonsentrasi, hitungRitual } from '../timing';

const spells = normalizeSpells(rawSpells);

describe('ringkasanWaktuMerapal', () => {
  const ringkasan = ringkasanWaktuMerapal(spells);

  it('mencakup seluruh spell tanpa ada yang terhitung dua kali', () => {
    expect(ringkasan.reduce((total, baris) => total + baris.jumlah, 0)).toBe(spells.length);
  });

  it('diurutkan dari yang paling banyak', () => {
    const jumlah = ringkasan.map((baris) => baris.jumlah);
    expect(jumlah).toEqual([...jumlah].sort((a, b) => b - a));
    expect(ringkasan[0].label).toBe('1 aksi');
  });

  it('memakai label berbahasa Indonesia', () => {
    expect(ringkasan.map((baris) => baris.label)).not.toContain('1 action');
  });

  it('menandai yang tidak bisa dirapal di tengah pertempuran', () => {
    const tanda = Object.fromEntries(ringkasan.map((b) => [b.label, b.diLuarPertempuran]));
    expect(tanda['1 aksi']).toBe(false);
    expect(tanda['1 aksi bonus']).toBe(false);
    expect(tanda['1 reaksi']).toBe(false);
    expect(tanda['1 menit']).toBe(true);
    expect(tanda['1 jam']).toBe(true);
  });
});

describe('ringkasanDurasi', () => {
  const ringkasan = ringkasanDurasi(spells);

  it('mengelompokkan seluruh spell tanpa sisa', () => {
    const total = Object.values(ringkasan).reduce((a, b) => a + b, 0);
    expect(total).toBe(spells.length);
  });

  it('memisahkan durasi maksimal dari durasi tetap', () => {
    // "Up to 1 hour" bisa dihentikan lebih awal, "8 hours" tidak.
    expect(ringkasan.maksimal).toBeGreaterThan(0);
    expect(ringkasan.tetap).toBeGreaterThan(0);
  });

  it('menghitung efek seketika', () => {
    expect(ringkasan.seketika).toBe(spells.filter((s) => s.duration === 'Instantaneous').length);
  });
});

describe('penghitung tag', () => {
  it('menghitung konsentrasi dan ritual', () => {
    expect(hitungKonsentrasi(spells)).toBe(spells.filter((s) => s.cardData.concentration).length);
    expect(hitungRitual(spells)).toBe(spells.filter((s) => s.cardData.ritual).length);
  });

  it('mengembalikan nol untuk daftar kosong', () => {
    expect(hitungKonsentrasi([])).toBe(0);
    expect(hitungRitual([])).toBe(0);
  });
});

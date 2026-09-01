import { describe, expect, it } from 'vitest';
import rawSpells from '../../data/spells-card.json';
import {
  normalizeSpells,
  filterSpells,
  formatLevel,
  shortLevel,
  buildTags,
  SCHOOLS,
  CLASSES,
} from '../spells';

const spells = normalizeSpells(rawSpells);
const cari = (name) => spells.find((spell) => spell.name === name);

const FILTER_KOSONG = { query: '', school: 'All', level: 'All', klass: 'All', sort: 'name' };

describe('normalizeSpells', () => {
  it('mengubah tulisan level jadi angka', () => {
    expect(cari('Fireball').level).toBe(3);
    expect(cari('Fire Bolt').level).toBe(0);
  });

  it('merapikan tulisan level yang salah di data mentah', () => {
    // Data SRD sempat menulis "1th/2th/3th Level".
    expect(formatLevel(1)).toBe('1st Level');
    expect(formatLevel(2)).toBe('2nd Level');
    expect(formatLevel(3)).toBe('3rd Level');
    expect(formatLevel(0)).toBe('Cantrip');
  });

  it('memberi label ringkas untuk lencana kartu', () => {
    expect(shortLevel(0)).toBe('Cantrip');
    expect(shortLevel(5)).toBe('Lv 5');
  });

  it('membangun indeks pencarian dari nama, ringkasan, dan deskripsi', () => {
    const fireball = cari('Fireball');
    expect(fireball.searchIndex).toContain('fireball');
    expect(fireball.searchIndex).toBe(fireball.searchIndex.toLowerCase());
  });

  it('memberi nilai pengganti untuk medan yang kosong', () => {
    const kosong = normalizeSpells([{ id: 'x', name: 'X', level: 'Cantrip', school: 'Evocation' }])[0];
    expect(kosong.castingTime).toBe('—');
    expect(kosong.classes).toEqual([]);
    expect(kosong.effectLines).toEqual([]);
  });
});

describe('filterSpells', () => {
  it('menyaring berdasarkan school, level, dan class sekaligus', () => {
    const hasil = filterSpells(spells, { ...FILTER_KOSONG, school: 'Evocation', level: 3, klass: 'Wizard' });
    expect(hasil.length).toBeGreaterThan(0);
    for (const spell of hasil) {
      expect(spell.school).toBe('Evocation');
      expect(spell.level).toBe(3);
      expect(spell.classes).toContain('Wizard');
    }
  });

  it('menerima level berupa teks dari elemen select', () => {
    const angka = filterSpells(spells, { ...FILTER_KOSONG, level: 9 });
    const teks = filterSpells(spells, { ...FILTER_KOSONG, level: '9' });
    expect(teks.map((s) => s.id)).toEqual(angka.map((s) => s.id));
  });

  it('mendahulukan spell yang namanya cocok', () => {
    // Pencarian menjangkau deskripsi juga, jadi "fireball" bisa memunculkan
    // spell lain yang kebetulan menyebutnya.
    const hasil = filterSpells(spells, { ...FILTER_KOSONG, query: 'fireball' });
    expect(hasil[0].name).toBe('Fireball');
    expect(hasil.map((s) => s.name)).toContain('Antimagic Field');
  });

  it('mengabaikan besar kecil huruf dan spasi berlebih', () => {
    const hasil = filterSpells(spells, { ...FILTER_KOSONG, query: '  FIREBALL  ' });
    expect(hasil[0].name).toBe('Fireball');
  });

  it('mengurutkan sesuai pilihan', () => {
    const perLevel = filterSpells(spells, { ...FILTER_KOSONG, sort: 'level' });
    const level = perLevel.map((s) => s.level);
    expect(level).toEqual([...level].sort((a, b) => a - b));

    const menurun = filterSpells(spells, { ...FILTER_KOSONG, sort: 'levelDesc' });
    expect(menurun[0].level).toBe(9);
  });

  it('mengembalikan daftar kosong kalau tidak ada yang cocok', () => {
    expect(filterSpells(spells, { ...FILTER_KOSONG, query: 'zxqwv' })).toEqual([]);
  });

  it('tidak mengubah daftar aslinya', () => {
    const sebelum = spells.map((s) => s.id);
    filterSpells(spells, { ...FILTER_KOSONG, sort: 'levelDesc' });
    expect(spells.map((s) => s.id)).toEqual(sebelum);
  });
});

describe('buildTags', () => {
  it('menandai konsentrasi dan ritual', () => {
    expect(buildTags(cari('Bless')).map((t) => t.text)).toContain('Konsentrasi');
    expect(buildTags(cari('Alarm')).map((t) => t.text)).toContain('Ritual');
  });

  it('tidak memberi tag pada spell biasa', () => {
    expect(buildTags(cari('Fire Bolt'))).toEqual([]);
  });
});

describe('kesesuaian dengan data', () => {
  it('setiap school pada data ada di daftar filter', () => {
    const dipakai = new Set(spells.map((s) => s.school));
    expect([...dipakai].filter((school) => !SCHOOLS.includes(school))).toEqual([]);
  });

  it('setiap class pada data ada di daftar filter', () => {
    const dipakai = new Set(spells.flatMap((s) => s.classes));
    expect([...dipakai].filter((klass) => !CLASSES.includes(klass))).toEqual([]);
  });

  it('semua id unik', () => {
    expect(new Set(spells.map((s) => s.id)).size).toBe(spells.length);
  });

  it('level selalu berada di rentang 0-9', () => {
    expect(spells.filter((s) => s.level < 0 || s.level > 9)).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import rawSpells from '../../data/spells-card.json';
import {
  castingTimeID,
  durationID,
  rangeID,
  rangeShortID,
  componentsID,
  componentsLongID,
  hasComponent,
  damageID,
  healingID,
  aoeID,
  noteID,
} from '../id';

describe('durationID', () => {
  it('menerjemahkan durasi yang terdaftar', () => {
    expect(durationID('Instantaneous')).toBe('Seketika');
    expect(durationID('Until dispelled')).toBe('Sampai dibubarkan');
  });

  it('menangani pola "Up to N unit"', () => {
    expect(durationID('Up to 10 minutes')).toBe('Maks. 10 menit');
    expect(durationID('Up to 1 hour')).toBe('Maks. 1 jam');
  });

  it('menganggap "Up to hour" tanpa angka sebagai 1 jam', () => {
    // Nilai ini benar-benar ada di data SRD.
    expect(durationID('Up to hour')).toBe('Maks. 1 jam');
  });

  it('mengembalikan tanda pisah untuk nilai kosong', () => {
    expect(durationID('')).toBe('—');
    expect(durationID(undefined)).toBe('—');
  });
});

describe('rangeID', () => {
  it('menghitung jumlah kotak peta dari jarak dalam kaki', () => {
    expect(rangeID('30 feet')).toBe('30 kaki (6 kotak)');
    expect(rangeID('150 feet')).toBe('150 kaki (30 kotak)');
  });

  it('menerjemahkan jarak khusus', () => {
    expect(rangeID('Self')).toBe('Diri sendiri');
    expect(rangeID('Touch')).toBe('Sentuhan');
    expect(rangeID('Unlimited')).toBe('Tak terbatas');
  });

  it('tidak menghitung kotak untuk satuan mil', () => {
    expect(rangeID('500 miles')).toBe('500 mil');
  });

  it('versi pendek tidak menyebut jumlah kotak', () => {
    expect(rangeShortID('30 feet')).toBe('30 kaki');
    expect(rangeShortID('Self')).toBe('Diri sendiri');
  });
});

describe('componentsID', () => {
  it('menerjemahkan setiap huruf komponen', () => {
    expect(componentsID('V, S, M')).toBe('Ucap · Gerak · Bahan');
    expect(componentsID('S')).toBe('Gerak');
  });

  it('mengembalikan tanda pisah kalau tidak ada komponen', () => {
    expect(componentsID('')).toBe('—');
  });

  it('hasComponent memeriksa huruf, bukan potongan teks', () => {
    expect(hasComponent('V, S', 'S')).toBe(true);
    expect(hasComponent('V, S', 'M')).toBe(false);
  });

  it('versi panjang menjelaskan tiap komponen', () => {
    expect(componentsLongID('V, S')).toHaveLength(2);
    expect(componentsLongID('V, S')[0]).toMatch(/^Verbal/);
  });
});

describe('damageID', () => {
  it('menerjemahkan jenis damage tanpa mengubah notasi dadu', () => {
    expect(damageID('8d6 Fire')).toBe('8d6 Api');
    expect(damageID('3d6 Bludgeoning')).toBe('3d6 Hantam');
  });

  it('menerjemahkan keterangan dalam kurung', () => {
    expect(damageID('4d4 Acid (Instant)')).toBe('4d4 Asam (langsung)');
    expect(damageID('2d4 Acid (Next Turn)')).toBe('2d4 Asam (giliran berikutnya)');
  });

  it('hanya mengganti kata utuh', () => {
    // "Force" tidak boleh ikut terganti di dalam kata lain.
    expect(damageID('10d6 + 40 Force')).toBe('10d6 + 40 Gaya');
  });
});

describe('healingID', () => {
  it('menerjemahkan istilah penyembuhan', () => {
    expect(healingID('1d8 + Spellcasting Modifier')).toBe('1d8 + modifier sihir');
    expect(healingID('Temporary HP equal to Spellcasting Modifier')).toBe(
      'HP sementara sebanyak modifier sihir',
    );
  });

  it('membiarkan nilai yang sudah berupa angka murni', () => {
    expect(healingID('70 HP')).toBe('70 HP');
  });
});

describe('aoeID', () => {
  it('membalik urutan jadi "bentuk lalu ukuran"', () => {
    expect(aoeID('20 ft Radius')).toBe('radius 20 kaki');
    expect(aoeID('15 ft Cone')).toBe('kerucut 15 kaki');
    expect(aoeID('10 ft Cube')).toBe('kubus 10 kaki');
  });

  it('membedakan satuan luas "sq ft" dari bentuk area "Square"', () => {
    // Keduanya jadi kata "persegi"; hanya bentuk yang boleh dipindah ke depan.
    expect(aoeID('2500 sq ft')).toBe('2500 kaki persegi');
    expect(aoeID('40,000 sq ft')).toBe('40,000 kaki persegi');
    expect(aoeID('20 ft Square')).toBe('persegi 20 kaki');
  });

  it('menangani satuan mil', () => {
    expect(aoeID('5 mile Radius')).toBe('radius 5 mil');
  });

  it('menangani bentuk gabungan dan ukuran bertingkat', () => {
    expect(aoeID('100 ft Wall / 60 ft Ring')).toBe('dinding 100 kaki / cincin 60 kaki');
    expect(aoeID('50x15x1 ft Wall')).toBe('dinding 50x15x1 kaki');
    expect(aoeID('20 ft Radius (Cylinder)')).toBe('radius 20 kaki (silinder)');
    expect(aoeID('30 ft Radius Sphere')).toBe('radius 30 kaki');
  });

  it('mengembalikan teks kosong untuk nilai kosong', () => {
    expect(aoeID(null)).toBe('');
  });
});

describe('noteID', () => {
  it('menerjemahkan frasa umum', () => {
    expect(noteID('Up to 3 makhluk')).toBe('Sampai 3 makhluk');
    expect(noteID('Half damage jika sukses')).toBe('separuh damage jika sukses');
    expect(noteID('300 ft Fly speed')).toBe('300 kaki kecepatan terbang');
  });

  it('membiarkan istilah baku D&D apa adanya', () => {
    // Istilah ini tertulis di lembar karakter dan stat block monster,
    // jadi sengaja tidak diterjemahkan.
    const note = 'Gagal WIS Save: Target terkena kondisi Charmed';
    expect(noteID(note)).toBe(note);
  });
});

describe('cakupan terhadap seluruh data SRD', () => {
  const SISA_INGGRIS =
    /\b(feet|miles?|hours?|minutes?|rounds?|days?|action|Instantaneous|Special|Unlimited|Sight|Touch|Self|Up to|Until)\b/;

  it.each([
    ['casting_time', (spell) => castingTimeID(spell.casting_time)],
    ['duration', (spell) => durationID(spell.duration)],
    ['range', (spell) => rangeID(spell.range)],
    ['components', (spell) => componentsID(spell.components)],
  ])('tidak ada nilai %s yang lolos tanpa terjemahan', (_field, translate) => {
    const lolos = rawSpells.map(translate).filter((value) => SISA_INGGRIS.test(value));
    expect(lolos).toEqual([]);
  });

  it('semua jenis damage dan area punya padanan Indonesia', () => {
    const JENIS_INGGRIS =
      /\b(Acid|Bludgeoning|Bludg|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder|Radius|Cube|Square|Sphere|Cone|Line|Cylinder|Wall|Ring)\b/;

    const lolos = rawSpells.flatMap((spell) => [
      ...(spell.card_data.damage ?? []).map(damageID),
      aoeID(spell.card_data.aoe),
    ]);

    expect(lolos.filter((value) => JENIS_INGGRIS.test(value))).toEqual([]);
  });
});

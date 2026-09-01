import { describe, expect, it } from 'vitest';
import rawSpells from '../../data/spells-card.json';
import { normalizeSpells } from '../spells';
import { buildHowTo, buildNotes } from '../howto';

const spells = normalizeSpells(rawSpells);
const cari = (name) => spells.find((spell) => spell.name === name);

describe('langkah merapal', () => {
  it('menyebut waktu dan apa yang dibutuhkan', () => {
    const [langkah] = buildHowTo(cari('Fireball'));
    expect(langkah).toBe('Habiskan 1 aksi: ucapkan mantra, satu tangan bebas, focus sihir.');
  });

  it('membedakan bahan habis pakai dari focus sihir', () => {
    expect(buildHowTo(cari('Antimagic Field'))[0]).toContain('bahan khusus (habis dipakai)');
    expect(buildHowTo(cari('Fireball'))[0]).toContain('focus sihir');
  });

  it('tidak menyebut kebutuhan kalau tidak ada komponen yang relevan', () => {
    const tanpaKomponen = normalizeSpells([
      { id: 'x', name: 'X', level: 'Cantrip', school: 'Evocation', casting_time: '1 action', components: '' },
    ])[0];
    expect(buildHowTo(tanpaKomponen)[0]).toBe('Habiskan 1 aksi.');
  });
});

describe('langkah sasaran', () => {
  it('menyebut jarak beserta jumlah kotak', () => {
    expect(buildHowTo(cari('Fireball'))[1]).toBe(
      'Pilih titik dalam 150 kaki (30 kotak), kena radius 20 kaki.',
    );
  });

  it('membedakan sentuhan dan diri sendiri', () => {
    expect(buildHowTo(cari('Cure Wounds'))[1]).toBe('Sentuh satu sasaran.');
    expect(buildHowTo(cari('Cone of Cold'))[1]).toBe('Efek berpusat pada dirimu, kerucut 60 kaki.');
  });
});

describe('langkah lemparan dadu', () => {
  it('menyebut save berikut nama abilitynya', () => {
    expect(buildHowTo(cari('Fireball'), 'card')[2]).toBe(
      'Sasaran lempar save DEX (Kelincahan) lawan DC sihirmu.',
    );
  });

  it('versi panjang menyertakan rumus DC', () => {
    expect(buildHowTo(cari('Fireball'), 'full')[2]).toContain('8 + bonus proficiency + modifier sihir');
  });

  it('menyebut serangan sihir untuk spell yang pakai attack roll', () => {
    expect(buildHowTo(cari('Acid Arrow'))[2]).toContain('Lempar serangan sihir');
  });

  it('menyatakan dengan jelas kalau tidak ada lemparan dadu', () => {
    expect(buildHowTo(cari('Cure Wounds'))[2]).toBe('Tidak ada lemparan dadu — efeknya langsung berlaku.');
  });
});

describe('langkah hasil', () => {
  it('menyebut damage dan akibat save yang berhasil', () => {
    expect(buildHowTo(cari('Fireball'))[3]).toBe('Kena: 8d6 Api; save berhasil: separuh damage.');
  });

  it('save yang berhasil tanpa half damage berarti tidak kena', () => {
    expect(buildHowTo(cari('Acid Splash'))[3]).toBe('Kena: 1d6 Asam; save berhasil: tidak kena.');
  });

  it('Acid Arrow tetap melukai separuh walau meleset', () => {
    // Satu-satunya spell yang punya attack roll sekaligus half damage;
    // menulis "meleset: tidak ada efek" untuk kasus ini salah aturan.
    expect(buildHowTo(cari('Acid Arrow'))[3]).toContain('meleset: separuh damage');
  });

  it('attack roll biasa berarti meleset tidak berefek', () => {
    expect(buildHowTo(cari('Fire Bolt'))[3]).toContain('meleset: tidak ada efek');
  });

  it('menyebut jumlah penyembuhan', () => {
    expect(buildHowTo(cari('Cure Wounds'))[3]).toBe('Pulihkan 1d8 + modifier sihir HP.');
  });
});

describe('langkah menjaga durasi', () => {
  it('menjelaskan aturan konsentrasi', () => {
    expect(buildHowTo(cari('Bless'), 'card').at(-1)).toBe(
      'Jaga konsentrasi sampai maks. 1 menit; kena damage → save CON DC 10.',
    );
    expect(buildHowTo(cari('Bless'), 'full').at(-1)).toContain('ambil yang lebih besar');
  });

  it('tidak menambah langkah untuk efek seketika', () => {
    expect(buildHowTo(cari('Fireball')).at(-1)).not.toContain('Bertahan');
  });

  it('menyebut lama bertahan untuk spell non-konsentrasi', () => {
    expect(buildHowTo(cari('Alarm')).at(-1)).toBe('Bertahan 8 jam.');
  });
});

describe('buildNotes', () => {
  it('menaruh keterangan ritual di urutan pertama', () => {
    expect(buildNotes(cari('Alarm'))[0]).toMatch(/^Ritual:/);
  });

  it('membuang catatan yang cuma mengulang isi langkah', () => {
    const catatan = buildNotes(cari('Cone of Cold'));
    expect(catatan.some((note) => /^(DEX|CON|STR|INT|WIS|CHA) Sav/i.test(note))).toBe(false);
    expect(catatan.some((note) => /^Half Damage on Success$/i.test(note))).toBe(false);
  });

  it('tetap menyimpan catatan yang membawa informasi baru', () => {
    expect(buildNotes(cari('Cone of Cold')).some((note) => note.includes('patung es'))).toBe(true);
  });
});

describe('berlaku untuk seluruh data', () => {
  it('setiap spell menghasilkan minimal tiga langkah', () => {
    const kurang = spells.filter((spell) => buildHowTo(spell).length < 3);
    expect(kurang.map((s) => s.name)).toEqual([]);
  });

  it('setiap langkah berakhir dengan tanda titik', () => {
    const tanpaTitik = spells.flatMap((spell) => buildHowTo(spell)).filter((step) => !step.endsWith('.'));
    expect(tanpaTitik).toEqual([]);
  });

  it('versi kartu tidak pernah lebih panjang dari versi lengkap', () => {
    for (const spell of spells) {
      const kartu = buildHowTo(spell, 'card').join(' ');
      const lengkap = buildHowTo(spell, 'full').join(' ');
      expect(kartu.length).toBeLessThanOrEqual(lengkap.length);
    }
  });

  it('tidak ada langkah yang membocorkan penanda internal aoeID', () => {
    // aoeID memakai satu karakter private-use sebagai penanda satuan luas;
    // karakter itu harus sudah tergantikan sebelum sampai ke kartu.
    const PRIVATE_USE = /[\uE000-\uF8FF]/;
    const bocor = spells.flatMap((spell) => buildHowTo(spell)).filter((step) => PRIVATE_USE.test(step));
    expect(bocor).toEqual([]);
  });
});

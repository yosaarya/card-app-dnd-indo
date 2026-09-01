// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadArtwork, saveArtwork, artworkSize } from '../storage';

const KEY = 'dnd_custom_spells';
const ART = 'data:image/jpeg;base64,AAA';
const TENGAH = { x: 50, y: 50, zoom: 1 };

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('loadArtwork', () => {
  it('mengembalikan objek kosong kalau belum ada apa-apa', () => {
    expect(loadArtwork()).toEqual({});
  });

  it('membaca entri lengkap beserta posisi dan tata letaknya', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ fireball: { art: ART, x: 20, y: 80, zoom: 1.5, layout: 'fullart' } }),
    );
    expect(loadArtwork()).toEqual({
      fireball: { art: ART, x: 20, y: 80, zoom: 1.5, layout: 'fullart' },
    });
  });

  it('memigrasikan format array paling lama', () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 'fireball', customArt: ART }]));
    expect(loadArtwork()).toEqual({ fireball: { art: ART, ...TENGAH, layout: null } });
  });

  it('memigrasikan format peta yang nilainya masih berupa teks', () => {
    // Gambar pada format itu sudah dipotong ke rasio kartu sejak diunggah,
    // jadi posisi tengah memang tampilan yang benar untuknya.
    localStorage.setItem(KEY, JSON.stringify({ fireball: ART }));
    expect(loadArtwork()).toEqual({ fireball: { art: ART, ...TENGAH, layout: null } });
  });

  it('membuang entri tanpa gambar', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ a: '', b: null, c: { x: 10 }, d: { art: ART }, e: { art: 123 } }),
    );
    expect(Object.keys(loadArtwork())).toEqual(['d']);
  });

  it('mengabaikan entri lama yang tidak lengkap', () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 'a' }, { customArt: ART }, { id: 'c', customArt: ART }]));
    expect(Object.keys(loadArtwork())).toEqual(['c']);
  });

  it('membatasi posisi dan pembesaran yang di luar jangkauan', () => {
    localStorage.setItem(KEY, JSON.stringify({ a: { art: ART, x: -40, y: 900, zoom: 12 } }));
    expect(loadArtwork().a).toEqual({ art: ART, x: 0, y: 100, zoom: 3, layout: null });
  });

  it('mengabaikan nama tata letak yang tidak dikenal', () => {
    localStorage.setItem(KEY, JSON.stringify({ a: { art: ART, layout: 'entahapa' } }));
    expect(loadArtwork().a.layout).toBeNull();
  });

  it('tidak melempar error dan membuang data yang rusak', () => {
    localStorage.setItem(KEY, '{bukan json');
    expect(loadArtwork()).toEqual({});
    // Data rusak dibuang supaya tidak gagal terus setiap halaman dibuka.
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('menangani nilai null yang tersimpan', () => {
    localStorage.setItem(KEY, 'null');
    expect(loadArtwork()).toEqual({});
  });
});

describe('saveArtwork', () => {
  it('menyimpan dan bisa dibaca lagi', () => {
    const entri = { a: { art: ART, x: 30, y: 70, zoom: 2, layout: 'fullart' } };
    expect(saveArtwork(entri)).toEqual({ ok: true });
    expect(loadArtwork()).toEqual(entri);
  });

  it('melaporkan kuota penuh alih-alih melempar error', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('penuh', 'QuotaExceededError');
    });
    expect(saveArtwork({ a: { art: ART } })).toEqual({ ok: false, reason: 'quota' });
  });

  it('membedakan storage yang diblokir dari kuota penuh', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('diblokir', 'SecurityError');
    });
    expect(saveArtwork({ a: { art: ART } })).toEqual({ ok: false, reason: 'unavailable' });
  });
});

describe('artworkSize', () => {
  it('menjumlahkan panjang gambar, bukan seluruh entri', () => {
    expect(artworkSize({ a: { art: 'xx' }, b: { art: 'yyy' } })).toBe(5);
    expect(artworkSize({ a: { art: 'xx' }, b: null })).toBe(2);
    expect(artworkSize({})).toBe(0);
  });
});

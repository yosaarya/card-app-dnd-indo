// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadArtwork, saveArtwork, artworkSize } from '../storage';

const KEY = 'dnd_custom_spells';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('loadArtwork', () => {
  it('mengembalikan objek kosong kalau belum ada apa-apa', () => {
    expect(loadArtwork()).toEqual({});
  });

  it('membaca format peta yang sekarang dipakai', () => {
    localStorage.setItem(KEY, JSON.stringify({ fireball: 'data:image/jpeg;base64,AAA' }));
    expect(loadArtwork()).toEqual({ fireball: 'data:image/jpeg;base64,AAA' });
  });

  it('memigrasikan format lama yang berupa array', () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 'fireball', customArt: 'data:x' }]));
    expect(loadArtwork()).toEqual({ fireball: 'data:x' });
  });

  it('mengabaikan entri lama yang tidak lengkap', () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 'a' }, { customArt: 'b' }, { id: 'c', customArt: 'd' }]));
    expect(loadArtwork()).toEqual({ c: 'd' });
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
    expect(saveArtwork({ a: 'data:1' })).toEqual({ ok: true });
    expect(loadArtwork()).toEqual({ a: 'data:1' });
  });

  it('melaporkan kuota penuh alih-alih melempar error', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('penuh', 'QuotaExceededError');
    });
    expect(saveArtwork({ a: 'data:1' })).toEqual({ ok: false, reason: 'quota' });
  });

  it('membedakan storage yang diblokir dari kuota penuh', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('diblokir', 'SecurityError');
    });
    expect(saveArtwork({ a: 'data:1' })).toEqual({ ok: false, reason: 'unavailable' });
  });
});

describe('artworkSize', () => {
  it('menjumlahkan panjang seluruh nilai', () => {
    expect(artworkSize({ a: 'xx', b: 'yyy' })).toBe(5);
    expect(artworkSize({})).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { clampTransform, normalizeEntry, artStyle, layoutFor, DEFAULT_TRANSFORM } from '../artwork';

const ART = 'data:image/jpeg;base64,AAA';

describe('clampTransform', () => {
  it('membiarkan nilai yang sudah sah', () => {
    expect(clampTransform({ x: 25, y: 75, zoom: 1.8 })).toEqual({ x: 25, y: 75, zoom: 1.8 });
  });

  it('membatasi posisi ke 0-100 persen', () => {
    expect(clampTransform({ x: -10, y: 250, zoom: 1 })).toEqual({ x: 0, y: 100, zoom: 1 });
  });

  it('membatasi pembesaran ke 1-3 kali', () => {
    expect(clampTransform({ zoom: 0.2 }).zoom).toBe(1);
    expect(clampTransform({ zoom: 99 }).zoom).toBe(3);
  });

  it('memakai nilai bawaan untuk angka yang tidak sah', () => {
    expect(clampTransform({ x: NaN, y: undefined, zoom: 'dua' })).toEqual(DEFAULT_TRANSFORM);
    expect(clampTransform()).toEqual(DEFAULT_TRANSFORM);
  });
});

describe('normalizeEntry', () => {
  it('menerima teks data URL sebagai entri format lama', () => {
    expect(normalizeEntry(ART)).toEqual({ art: ART, ...DEFAULT_TRANSFORM, layout: null });
  });

  it('menolak nilai yang tidak membawa gambar maupun tata letak', () => {
    for (const nilai of [null, undefined, '', 0, {}, { art: '' }, { art: 42 }, { layout: 'entahapa' }]) {
      expect(normalizeEntry(nilai)).toBeNull();
    }
  });

  it('menerima pilihan tata letak walau kartunya belum punya gambar', () => {
    expect(normalizeEntry({ layout: 'fullart' })).toEqual({
      art: '',
      ...DEFAULT_TRANSFORM,
      layout: 'fullart',
    });
  });

  it('hanya menerima nama tata letak yang dikenal', () => {
    expect(normalizeEntry({ art: ART, layout: 'fullart' }).layout).toBe('fullart');
    expect(normalizeEntry({ art: ART, layout: 'frame' }).layout).toBe('frame');
    // 'toString' dan 'constructor' ada di prototype chain; keduanya harus
    // tetap ditolak, bukan diterima sebagai nama tata letak.
    expect(normalizeEntry({ art: ART, layout: 'toString' }).layout).toBeNull();
    expect(normalizeEntry({ art: ART, layout: 'constructor' }).layout).toBeNull();
  });
});

describe('artStyle', () => {
  it('memetakan posisi ke object-position', () => {
    expect(artStyle({ x: 20, y: 80, zoom: 1 })).toMatchObject({ objectPosition: '20% 80%' });
  });

  it('tidak memasang transform kalau tidak diperbesar', () => {
    expect(artStyle({ x: 50, y: 50, zoom: 1 }).transform).toBeUndefined();
  });

  it('memperbesar dengan titik acuan mengikuti posisi yang dilihat', () => {
    const style = artStyle({ x: 10, y: 90, zoom: 2 });
    expect(style.transform).toBe('scale(2)');
    expect(style.transformOrigin).toBe('10% 90%');
  });
});

describe('layoutFor', () => {
  it('pilihan kartu mengalahkan pilihan global', () => {
    expect(layoutFor({ layout: 'fullart' }, 'frame')).toBe('fullart');
  });

  it('ikut pilihan global kalau kartu belum memilih', () => {
    expect(layoutFor({ layout: null }, 'fullart')).toBe('fullart');
    expect(layoutFor(null, 'fullart')).toBe('fullart');
  });

  it('kembali ke bawaan kalau pilihan global tidak dikenal', () => {
    expect(layoutFor(null, 'entahapa')).toBe('frame');
    expect(layoutFor(null, 'valueOf')).toBe('frame');
    expect(layoutFor(null, undefined)).toBe('frame');
  });
});

import { useEffect } from 'react';

/**
 * Menahan halaman di belakang dialog agar tidak ikut bergulir.
 *
 * Tanpa ini muncul dua bilah gulir sekaligus dan roda tetikus menggulirkan
 * daftar kartu di belakang, bukan isi dialognya.
 *
 * Pengunci dihitung, bukan dinyalakan-dimatikan: kalau dua dialog terbuka
 * bersamaan, yang tertutup lebih dulu tidak boleh membuka kunci milik yang
 * masih terbuka.
 */
let penguncian = 0;
let overflowAsli = '';

export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;

    if (penguncian === 0) {
      overflowAsli = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    penguncian += 1;

    return () => {
      penguncian -= 1;
      if (penguncian === 0) document.body.style.overflow = overflowAsli;
    };
  }, [active]);
}

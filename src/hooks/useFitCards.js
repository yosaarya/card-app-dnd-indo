import { useEffect, useLayoutEffect, useRef } from 'react';
import { fitCards } from '../lib/fitCards';

/**
 * Menjalankan penyesuaian ukuran teks kartu setiap kali isi wadah berubah.
 * Pengukuran diulang setelah font selesai dimuat, karena lebar teks — dan
 * karenanya jumlah baris — berubah begitu font pengganti tergantikan.
 */
export function useFitCards(dependency) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    fitCards(ref.current);
  }, [dependency]);

  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) fitCards(ref.current);
    });
    return () => {
      cancelled = true;
    };
  }, [dependency]);

  return ref;
}

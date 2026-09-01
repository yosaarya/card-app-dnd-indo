/**
 * Menyesuaikan ukuran teks tiap kartu supaya isinya muat di bingkai.
 *
 * Panjang teks antar spell sangat berbeda (ada yang 3 langkah pendek, ada yang
 * 5 langkah plus catatan), jadi satu ukuran font tidak mungkin pas untuk
 * semuanya. Di sini ukurannya diukur langsung dari DOM, bukan ditebak.
 *
 * Yang disetel adalah --sc-fit, sebuah pengali, bukan ukuran mutlak. Kartu
 * layar memakai --sc-unit 10px dan kartu cetak 2,625mm dengan proporsi yang
 * sama, jadi pengali hasil pengukuran di layar tetap berlaku di atas kertas.
 */

const LADDER = [1, 0.94, 0.88, 0.82, 0.76, 0.7, 0.64, 0.58];

/**
 * Semua penulisan gaya dilakukan sebelum semua pembacaan pada tiap putaran,
 * sehingga browser cukup menghitung tata letak sekali per putaran — bukan
 * sekali per kartu.
 *
 * @param {ParentNode} root wadah yang memuat elemen .sc-card
 */
export function fitCards(root) {
  if (!root) return;

  let pending = Array.from(root.querySelectorAll('.sc-card'));

  for (const scale of LADDER) {
    if (pending.length === 0) return;

    for (const card of pending) {
      card.style.setProperty('--sc-fit', String(scale));
    }

    pending = pending.filter((card) => {
      const rules = card.querySelector('.sc-rules');
      return rules ? rules.scrollHeight > rules.clientHeight + 0.5 : false;
    });
  }
}

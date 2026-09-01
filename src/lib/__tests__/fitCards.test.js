// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { fitCards } from '../fitCards';

/**
 * jsdom tidak menghitung tata letak, jadi scrollHeight dan clientHeight
 * dipalsukan: tinggi isi dianggap berbanding lurus dengan --sc-fit, persis
 * seperti perilaku sebenarnya di browser.
 */
function buatKartu(tinggiIsiPadaSkalaSatu, tinggiKotak = 100) {
  const card = document.createElement('div');
  card.className = 'sc-card';

  const rules = document.createElement('div');
  rules.className = 'sc-rules';
  card.appendChild(rules);

  Object.defineProperty(rules, 'clientHeight', { get: () => tinggiKotak });
  Object.defineProperty(rules, 'scrollHeight', {
    get: () => {
      const fit = Number(card.style.getPropertyValue('--sc-fit') || 1);
      return Math.ceil(tinggiIsiPadaSkalaSatu * fit);
    },
  });

  return card;
}

function pasang(...kartu) {
  const root = document.createElement('div');
  for (const card of kartu) root.appendChild(card);
  document.body.replaceChildren(root);
  return root;
}

const skala = (card) => Number(card.style.getPropertyValue('--sc-fit'));

describe('fitCards', () => {
  it('membiarkan kartu yang sudah muat pada ukuran penuh', () => {
    const card = buatKartu(80);
    fitCards(pasang(card));
    expect(skala(card)).toBe(1);
  });

  it('menurunkan ukuran sampai isinya muat', () => {
    const card = buatKartu(120); // butuh skala <= 0.83
    fitCards(pasang(card));
    expect(skala(card)).toBeLessThanOrEqual(0.83);
    expect(card.querySelector('.sc-rules').scrollHeight).toBeLessThanOrEqual(100);
  });

  it('memilih skala terbesar yang masih muat, bukan yang terkecil', () => {
    const card = buatKartu(105);
    fitCards(pasang(card));
    expect(skala(card)).toBe(0.94);
  });

  it('menyetel tiap kartu secara mandiri', () => {
    const longgar = buatKartu(80);
    const padat = buatKartu(150);
    fitCards(pasang(longgar, padat));
    expect(skala(longgar)).toBe(1);
    expect(skala(padat)).toBeLessThan(skala(longgar));
  });

  it('berhenti di skala terkecil kalau isinya tetap tidak muat', () => {
    const card = buatKartu(1000);
    fitCards(pasang(card));
    expect(skala(card)).toBe(0.58);
  });

  it('mengabaikan kartu tanpa kotak aturan', () => {
    const tanpaKotak = document.createElement('div');
    tanpaKotak.className = 'sc-card';
    expect(() => fitCards(pasang(tanpaKotak))).not.toThrow();
  });

  it('tidak melakukan apa-apa kalau wadahnya tidak ada', () => {
    expect(() => fitCards(null)).not.toThrow();
  });
});

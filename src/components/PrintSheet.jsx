import React from 'react';
import SpellCard from './SpellCard';

const CARDS_PER_PAGE = 9; // grid 3 x 3 pada A4

function paginate(cards) {
  const pages = [];
  for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
    pages.push(cards.slice(i, i + CARDS_PER_PAGE));
  }
  return pages;
}

/**
 * Antrean kartu yang dirender sebagai halaman A4. Hanya terlihat saat
 * mencetak (lihat print.css); di layar elemen ini disembunyikan.
 */
export default function PrintSheet({ cards }) {
  return (
    <div className="print-sheet" aria-hidden="true">
      {paginate(cards).map((page, pageIndex) => (
        <div className="print-page" key={`page-${pageIndex}`}>
          {page.map((card) => (
            <div className="print-slot" key={card.instanceId}>
              <SpellCard spell={card} variant="print" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

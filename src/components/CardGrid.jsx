import React from 'react';
import SpellCard from './SpellCard';

export default function CardGrid({ spells, onAddSpell }) {
  // Kondisi jika hasil pencarian/filter kosong
  if (spells.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p className="text-lg font-semibold">Tidak ada spell yang cocok.</p>
        <p className="text-sm">Coba ubah kombinasi filter atau kata kunci pencarianmu.</p>
      </div>
    );
  }

  // Render grid kartu spell
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
      {spells.map((spell) => (
        <SpellCard
          key={spell.id}
          spell={spell}
          onAdd={onAddSpell} // Mengoper fungsi nambah antrean ke tiap komponen anak
        />
      ))}
    </div>
  );
}
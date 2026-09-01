import React, { useRef, useState } from 'react';
import { Crop, Info, Minus, Plus, Trash2, Upload } from 'lucide-react';
import SpellCard from './SpellCard';

const ICON_BUTTON =
  'flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 text-slate-300 ' +
  'hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors';

/**
 * Kartu di grid beserta kontrolnya.
 *
 * Kontrol sengaja diletakkan di bawah kartu, bukan menumpang di atasnya:
 * kartu di layar harus tetap menjadi pratinjau persis dari hasil cetak.
 */
export default function SpellTile({
  spell,
  count,
  layout,
  onAdd,
  onRemove,
  onArtwork,
  onClearArtwork,
  onShowDetail,
  onEditArt,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onArtwork(spell.id, file);
  };

  const handleFilePick = (event) => {
    const file = event.target.files?.[0];
    if (file) onArtwork(spell.id, file);
    event.target.value = ''; // izinkan memilih berkas yang sama lagi
  };

  return (
    <div className="w-[240px]">
      <div
        className={`relative rounded-2xl transition-transform duration-200 ${isDragging ? 'scale-[1.03]' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <SpellCard
          spell={spell}
          layout={layout}
          className={`border-2 shadow-xl transition-colors ${
            isDragging
              ? 'border-purple-400 ring-4 ring-purple-500/30'
              : count > 0
                ? 'border-purple-500/80'
                : 'border-slate-700'
          }`}
        />

        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-slate-950/80 text-sm font-bold text-purple-200">
            <Upload size={18} className="mr-2" aria-hidden="true" />
            Lepas untuk pasang artwork
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onShowDetail(spell)}
          className={ICON_BUTTON}
          title="Lihat deskripsi lengkap"
          aria-label={`Lihat deskripsi lengkap ${spell.name}`}
        >
          <Info size={14} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={ICON_BUTTON}
          title="Pilih artwork"
          aria-label={`Pilih artwork untuk ${spell.name}`}
        >
          <Upload size={14} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => onEditArt(spell)}
          className={ICON_BUTTON}
          title="Atur posisi gambar dan tata letak"
          aria-label={`Atur tampilan kartu ${spell.name}`}
        >
          <Crop size={14} aria-hidden="true" />
        </button>

        {spell.artwork?.art && (
          <button
            type="button"
            onClick={() => onClearArtwork(spell.id)}
            className={`${ICON_BUTTON} hover:!border-red-500 hover:!bg-red-600 hover:!text-white`}
            title="Hapus artwork"
            aria-label={`Hapus artwork ${spell.name}`}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFilePick}
          tabIndex={-1}
        />

        <div className="ml-auto flex items-center gap-1">
          {count > 0 && (
            <>
              <button
                type="button"
                onClick={() => onRemove(spell.id)}
                className={`${ICON_BUTTON} hover:!border-red-500 hover:!bg-red-600 hover:!text-white`}
                aria-label={`Kurangi ${spell.name} dari antrean cetak`}
              >
                <Minus size={14} aria-hidden="true" />
              </button>
              <span
                className="min-w-[20px] text-center text-xs font-black tabular-nums text-purple-300"
                aria-label={`${count} kartu di antrean`}
              >
                {count}
              </span>
            </>
          )}
          <button
            type="button"
            onClick={() => onAdd(spell)}
            className={`${ICON_BUTTON} !border-purple-500 !bg-purple-600 !text-white hover:!bg-purple-500`}
            aria-label={`Tambahkan ${spell.name} ke antrean cetak`}
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

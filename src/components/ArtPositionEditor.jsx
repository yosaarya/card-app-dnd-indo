import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import SpellCard from './SpellCard';
import { clampTransform, layoutFor, LAYOUTS, ZOOM_MAX, ZOOM_MIN } from '../lib/artwork';

const ZOOM_STEP = 0.1;
const NUDGE = 2; // persen per tekan tombol panah

/**
 * Penyunting posisi artwork.
 *
 * Pratinjaunya adalah komponen kartu yang sama persis dengan yang dipakai di
 * grid dan lembar cetak, jadi apa yang diatur di sini itulah yang tercetak.
 *
 * Menggeser dipetakan terbalik: menarik gambar ke kiri berarti melihat bagian
 * kanannya, sehingga object-position harus naik. Perhitungannya memakai lebar
 * kartu sebagai acuan agar kecepatan geser terasa wajar pada semua zoom.
 */
export default function ArtPositionEditor({ spell, entry, globalLayout, onChange, onReset, onClose }) {
  const [dragging, setDragging] = useState(false);
  const surfaceRef = useRef(null);
  const dragRef = useRef(null);
  const closeRef = useRef(null);

  useBodyScrollLock(true);

  const transform = clampTransform(entry);
  const layout = layoutFor(entry, globalLayout);

  const apply = useCallback(
    (patch) => onChange(clampTransform({ ...transform, ...patch })),
    [onChange, transform],
  );

  // Dipisah dari pemasangan listener: kalau digabung, onClose yang berganti
  // identitas tiap render akan menjalankan ulang efeknya dan merebut fokus
  // dari elemen yang sedang dipakai pengguna.
  useEffect(() => {
    closeRef.current?.focus();
  }, [spell.id]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const onPointerDown = (event) => {
    if (event.button !== 0 || !entry?.art) return;
    const box = surfaceRef.current?.getBoundingClientRect();
    if (!box) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, ...transform, box };
    setDragging(true);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;

    // Membagi dengan zoom membuat geseran terasa sama cepat pada tiap
    // pembesaran: makin dekat, makin halus.
    const dx = ((event.clientX - drag.startX) / drag.box.width / drag.zoom) * 100;
    const dy = ((event.clientY - drag.startY) / drag.box.height / drag.zoom) * 100;
    apply({ x: drag.x - dx, y: drag.y - dy });
  };

  const endDrag = (event) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const onKeyDownSurface = (event) => {
    const arah = {
      ArrowLeft: { x: -NUDGE },
      ArrowRight: { x: NUDGE },
      ArrowUp: { y: -NUDGE },
      ArrowDown: { y: NUDGE },
      '+': { zoom: ZOOM_STEP },
      '=': { zoom: ZOOM_STEP },
      '-': { zoom: -ZOOM_STEP },
    }[event.key];
    if (!arah) return;

    event.preventDefault();
    // Perubahan relatif dikirim sebagai fungsi supaya tekan tombol beruntun
    // tidak saling menimpa karena membaca posisi yang sudah basi.
    onChange((sekarang) => ({
      x: sekarang.x + (arah.x ?? 0),
      y: sekarang.y + (arah.y ?? 0),
      zoom: sekarang.zoom + (arah.zoom ?? 0),
    }));
  };

  return (
    <div
      className="screen-only fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="art-editor-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="art-editor-title" className="text-base font-black uppercase tracking-wide">
              Atur tampilan kartu
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">{spell.name}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex-none rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Tutup penyunting"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex justify-center">
          <div
            ref={surfaceRef}
            role="application"
            tabIndex={0}
            aria-label="Geser gambar dengan tetikus atau tombol panah, perbesar dengan + dan -"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKeyDownSurface}
            className={`rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 ${
              entry?.art ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
            }`}
            style={{ touchAction: 'none' }}
          >
            <SpellCard
              spell={{ ...spell, artwork: entry }}
              layout={layout}
              className="border-2 border-slate-700"
            />
          </div>
        </div>

        {!entry?.art && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Belum ada gambar. Pasang artwork dulu untuk bisa mengatur posisinya.
          </p>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tata letak
            </span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(LAYOUTS).map(([id, { label, hint }]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChange({ layout: id })}
                  aria-pressed={layout === id}
                  title={hint}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    layout === id
                      ? 'border-purple-500 bg-purple-600 text-white'
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{LAYOUTS[layout].hint}</p>
          </div>

          <div>
            <label
              htmlFor="art-zoom"
              className="mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400"
            >
              Perbesaran
              <span className="tabular-nums text-purple-300">{transform.zoom.toFixed(1)}×</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => apply({ zoom: transform.zoom - ZOOM_STEP })}
                disabled={!entry?.art || transform.zoom <= ZOOM_MIN}
                className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-40"
                aria-label="Perkecil"
              >
                <ZoomOut size={15} aria-hidden="true" />
              </button>
              <input
                id="art-zoom"
                type="range"
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step="0.05"
                value={transform.zoom}
                disabled={!entry?.art}
                onChange={(event) => apply({ zoom: Number(event.target.value) })}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-700 accent-purple-500 disabled:opacity-40"
              />
              <button
                type="button"
                onClick={() => apply({ zoom: transform.zoom + ZOOM_STEP })}
                disabled={!entry?.art || transform.zoom >= ZOOM_MAX}
                className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-40"
                aria-label="Perbesar"
              >
                <ZoomIn size={15} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-3">
            <p className="text-[11px] leading-relaxed text-slate-500">
              Seret gambarnya, atau pakai tombol panah setelah kartunya difokus.
            </p>
            <button
              type="button"
              onClick={onReset}
              disabled={!entry?.art}
              className="flex flex-none items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-40"
            >
              <RotateCcw size={13} aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

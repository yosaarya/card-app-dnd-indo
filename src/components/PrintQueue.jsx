import React from 'react';
import { HelpCircle, Printer, Trash2, X } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { shortLevel } from '../lib/spells';
import { schoolAccent } from '../lib/schools';

const CARDS_PER_PAGE = 9;

/** Panel antrean cetak: daftar kartu terpilih, hapus per item, dan tombol cetak. */
export default function PrintQueue({ open, cards, onClose, onRemoveAt, onClear, onPrint, onOpenGuide }) {
  useBodyScrollLock(open);

  if (!open) return null;

  const pages = Math.ceil(cards.length / CARDS_PER_PAGE);

  return (
    <div className="screen-only fixed inset-0 z-[90] flex justify-end bg-slate-950/70" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Antrean cetak"
        className="flex h-full w-full max-w-sm flex-col border-l border-slate-800 bg-slate-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex flex-none items-center justify-between border-b border-slate-800 px-4 py-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider">Antrean cetak</h2>
            <p className="text-xs text-slate-400">
              {cards.length} kartu · {pages || 0} halaman A4
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Tutup antrean"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3">
          {cards.length === 0 ? (
            <p className="mt-10 text-center text-sm text-slate-500">
              Belum ada kartu. Tekan tombol <span className="font-bold text-purple-300">+</span> pada kartu
              untuk menambahkannya ke antrean.
            </p>
          ) : (
            <ol className="space-y-1.5">
              {cards.map((card, index) => (
                <li
                  key={card.instanceId}
                  className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2"
                >
                  <span className="w-5 shrink-0 text-right text-[11px] tabular-nums text-slate-500">
                    {index + 1}
                  </span>
                  <span
                    className="h-6 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: schoolAccent(card.school) }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-200">{card.name}</span>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500">
                      {shortLevel(card.level)} · {card.school}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveAt(index)}
                    className="rounded p-1 text-slate-500 hover:bg-red-600/20 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label={`Hapus ${card.name} dari antrean`}
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>

        <footer className="flex-none space-y-2 border-t border-slate-800 p-3">
          {/* Salah satu dari tiga setelan ini keliru = hasil cetak meleset
              ukurannya atau kehilangan latar gelap kartu. */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-purple-300">
              Setel dulu di dialog cetak
            </p>
            <ul className="space-y-0.5 text-[11px] leading-relaxed text-slate-400">
              <li>
                Kertas <span className="font-semibold text-slate-200">A4</span>, tegak
              </li>
              <li>
                Margin <span className="font-semibold text-slate-200">None / 0</span>
              </li>
              <li>
                <span className="font-semibold text-slate-200">Background graphics</span> dicentang
              </li>
            </ul>
            <button
              type="button"
              onClick={onOpenGuide}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
            >
              <HelpCircle size={12} aria-hidden="true" />
              Panduan cetak lengkap
            </button>
          </div>

          <button
            type="button"
            onClick={onPrint}
            disabled={cards.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
          >
            <Printer size={16} aria-hidden="true" />
            Cetak / simpan PDF
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={cards.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:text-slate-600"
          >
            <Trash2 size={14} aria-hidden="true" />
            Kosongkan antrean
          </button>
        </footer>
      </div>
    </div>
  );
}

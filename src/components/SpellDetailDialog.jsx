import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { formatLevel } from '../lib/spells';
import { schoolAccent } from '../lib/schools';

/** Deskripsi SRD memakai penanda ***Judul.*** yang tidak perlu ditampilkan. */
function cleanParagraph(text) {
  return text.replace(/\*\*\*?/g, '');
}

const META = [
  ['Casting time', 'castingTime'],
  ['Range', 'range'],
  ['Components', 'components'],
  ['Duration', 'duration'],
];

/** Dialog berisi deskripsi resmi lengkap, untuk teks yang tidak muat di kartu. */
export default function SpellDetailDialog({ spell, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!spell) return undefined;

    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [spell, onClose]);

  if (!spell) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 screen-only"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="spell-detail-title"
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="spell-detail-title" className="text-xl font-black uppercase tracking-wide">
              {spell.name}
            </h2>
            <p
              className="mt-1 text-xs font-bold uppercase tracking-widest"
              style={{ color: schoolAccent(spell.school) }}
            >
              {formatLevel(spell.level)} • {spell.school}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Tutup detail"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {META.map(([label, key]) => (
            <div key={key}>
              <dt className="text-[11px] uppercase tracking-wider text-slate-500">{label}</dt>
              <dd className="text-slate-200">{spell[key]}</dd>
            </div>
          ))}
          <div className="col-span-2">
            <dt className="text-[11px] uppercase tracking-wider text-slate-500">Class</dt>
            <dd className="text-slate-200">{spell.classes.join(', ') || '—'}</dd>
          </div>
        </dl>

        {spell.summary && (
          <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm font-semibold text-slate-200">
            {spell.summary}
          </p>
        )}

        {spell.effectLines.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-slate-300">
            {spell.effectLines.map((line, index) => (
              <li key={index}>
                • {line.label ? `${line.label}: ` : ''}
                {line.text}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 border-t border-slate-800 pt-4">
          <h3 className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Deskripsi resmi (SRD)</h3>
          {spell.description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2 text-sm leading-relaxed text-slate-300">
              {cleanParagraph(paragraph)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

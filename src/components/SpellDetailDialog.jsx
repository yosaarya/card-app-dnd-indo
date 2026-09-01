import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { formatLevel } from '../lib/spells';
import { buildHowTo, buildNotes } from '../lib/howto';
import { castingTimeID, durationID, rangeID, componentsLongID, SCHOOL_ID, CLASS_ID } from '../lib/id';
import { schoolAccent } from '../lib/schools';

/** Deskripsi SRD memakai penanda ***Judul.*** yang tidak perlu ditampilkan. */
function cleanParagraph(text) {
  return text.replace(/\*\*\*?/g, '');
}

function Row({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="text-slate-200">{children}</dd>
    </div>
  );
}

/** Keterangan lengkap: langkah versi panjang, catatan, lalu teks asli SRD. */
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

  const accent = schoolAccent(spell.school);
  const school = SCHOOL_ID[spell.school];
  const steps = buildHowTo(spell, 'full');
  const notes = buildNotes(spell);
  const components = componentsLongID(spell.components);

  return (
    <div
      className="screen-only fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="spell-detail-title"
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="spell-detail-title" className="text-xl font-black uppercase tracking-wide">
              {spell.name}
            </h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
              {formatLevel(spell.level)} • {spell.school}
            </p>
            {school && (
              <p className="mt-0.5 text-xs text-slate-500">
                {school.name} — {school.gloss}
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex-none rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Tutup detail"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <Row label="Waktu merapal">{castingTimeID(spell.castingTime)}</Row>
          <Row label="Jarak">{rangeID(spell.range)}</Row>
          <Row label="Durasi">{durationID(spell.duration)}</Row>
          <Row label="Class">
            {spell.classes.map((klass) => `${klass}${CLASS_ID[klass] ? ` (${CLASS_ID[klass]})` : ''}`).join(', ') ||
              '—'}
          </Row>
        </dl>

        {components.length > 0 && (
          <ul className="mt-3 space-y-0.5 text-sm text-slate-400">
            {components.map((component) => (
              <li key={component}>• {component}</li>
            ))}
          </ul>
        )}

        {spell.summary && (
          <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm font-semibold text-slate-200">
            {spell.summary}
          </p>
        )}

        <div className="mt-4">
          <h3 className="mb-2 text-[11px] font-black uppercase tracking-widest text-purple-300">Cara pakai</h3>
          <ol className="space-y-1.5">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-purple-600/30 text-[11px] font-black text-white">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {notes.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-[11px] font-black uppercase tracking-widest text-purple-300">Catatan</h3>
            <ul className="space-y-1 text-sm leading-relaxed text-slate-300">
              {notes.map((note, index) => (
                <li key={index}>› {note}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 border-t border-slate-800 pt-4">
          <h3 className="mb-1 text-[11px] uppercase tracking-wider text-slate-500">
            Teks asli SRD (bahasa Inggris)
          </h3>
          {spell.description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2 text-sm leading-relaxed text-slate-400">
              {cleanParagraph(paragraph)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ImagePlus } from 'lucide-react';
import { shortLevel, buildTags } from '../lib/spells';
import { buildHowTo, buildNotes } from '../lib/howto';
import { castingTimeID, durationID, rangeShortID, componentsID } from '../lib/id';
import { schoolAccent } from '../lib/schools';
import { artStyle, DEFAULT_LAYOUT } from '../lib/artwork';

/**
 * Kartu spell. Komponen ini dipakai untuk semuanya — grid layar, lembar
 * cetak, dan pratinjau di penyunting posisi — supaya tidak mungkin ada
 * tampilan yang berbeda dari hasil cetaknya.
 *
 * Satu urutan DOM melayani kedua tata letak: pada mode full-art, jendela
 * gambar dan peredupnya diposisikan absolut sehingga keluar dari alur, dan
 * sisa isinya menumpuk di atas gambar.
 */
export default function SpellCard({ spell, variant = 'screen', layout = DEFAULT_LAYOUT, className = '' }) {
  const steps = buildHowTo(spell, 'card');
  const notes = buildNotes(spell);
  const tags = buildTags(spell);

  // Langkah selalu dimuat penuh karena itu inti kartunya. Catatan dibatasi
  // supaya kartu tidak dipenuhi teks kecil; sisanya disebutkan jumlahnya dan
  // bisa dibaca lengkap di dialog detail.
  const noteBudget = Math.max(1, 7 - steps.length);
  const visibleNotes = notes.slice(0, noteBudget);
  const hiddenNotes = notes.length - visibleNotes.length;

  return (
    <article
      className={`sc-card ${className}`}
      data-variant={variant}
      data-layout={layout}
      data-longname={spell.name.length > 18}
      style={{ '--sc-accent': schoolAccent(spell.school) }}
    >
      <header className="sc-titlebar">
        <h3 className="sc-name">{spell.name}</h3>
        <span className="sc-cost" title="Level spell">
          {shortLevel(spell.level)}
        </span>
      </header>

      <div className="sc-window">
        {spell.artwork?.art ? (
          <img
            className="sc-art"
            src={spell.artwork.art}
            style={artStyle(spell.artwork)}
            alt={`Artwork ${spell.name}`}
          />
        ) : (
          <div className="sc-art-empty">
            {variant === 'screen' && <ImagePlus size={16} aria-hidden="true" />}
            <span>{variant === 'screen' ? 'Jatuhkan gambar di sini' : 'Tanpa artwork'}</span>
          </div>
        )}
      </div>

      <div className="sc-scrim" aria-hidden="true" />
      <div className="sc-spacer" aria-hidden="true" />

      <p className="sc-typeline">
        <span className="sc-school">{spell.school}</span>
        <span className="sc-classes">{spell.classes.join(' · ') || 'Tanpa class'}</span>
      </p>

      <div className="sc-rules">
        {spell.summary && <p className="sc-flavor">{spell.summary}</p>}

        <p className="sc-heading">Cara pakai</p>
        <ol className="sc-steps">
          {steps.map((step, index) => (
            <li key={index}>
              <span className="sc-clamp">{step}</span>
            </li>
          ))}
        </ol>

        {visibleNotes.length > 0 && (
          <ul className="sc-notes">
            {visibleNotes.map((note, index) => (
              <li key={index}>
                <span className="sc-clamp">{note}</span>
              </li>
            ))}
          </ul>
        )}

        {hiddenNotes > 0 && <p className="sc-more">+{hiddenNotes} catatan lain</p>}

        {tags.length > 0 && (
          <div className="sc-tags">
            {tags.map((tag) => (
              <span key={tag.text} className={`sc-tag sc-tag-${tag.tone}`}>
                {tag.text}
              </span>
            ))}
          </div>
        )}
      </div>

      <dl className="sc-footer">
        <div>
          <dt>Waktu</dt>
          <dd>{castingTimeID(spell.castingTime)}</dd>
        </div>
        <div>
          <dt>Jarak</dt>
          <dd>{rangeShortID(spell.range)}</dd>
        </div>
        <div>
          <dt>Durasi</dt>
          <dd>{durationID(spell.duration)}</dd>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <dt>Butuh</dt>
          <dd>{componentsID(spell.components)}</dd>
        </div>
      </dl>
    </article>
  );
}

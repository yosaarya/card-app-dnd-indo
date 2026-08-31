import React from 'react';
import { ImagePlus } from 'lucide-react';
import { shortLevel, buildTags } from '../lib/spells';
import { schoolAccent } from '../lib/schools';

/** Berapa baris efek yang muat sebelum kartu terasa sesak. */
const LINE_BUDGET = 6;

function densityOf(lineCount) {
  if (lineCount <= 3) return 'normal';
  if (lineCount <= 5) return 'dense';
  return 'packed';
}

/**
 * Satu kartu spell. Komponen ini dipakai dua kali dengan markup identik:
 * di grid layar dan di lembar cetak (`variant="print"`), sehingga apa yang
 * dilihat pengguna sama dengan apa yang keluar dari printer.
 */
export default function SpellCard({ spell, variant = 'screen', className = '' }) {
  const lines = spell.effectLines;
  const visibleLines = lines.slice(0, LINE_BUDGET);
  const hiddenCount = lines.length - visibleLines.length;
  const tags = buildTags(spell);

  return (
    <article
      className={`sc-card ${className}`}
      data-density={densityOf(lines.length)}
      data-variant={variant}
      style={{ '--sc-accent': schoolAccent(spell.school) }}
    >
      {spell.artwork ? (
        <img className="sc-art" src={spell.artwork} alt={`Artwork ${spell.name}`} />
      ) : (
        <div className="sc-art-empty">
          {variant === 'screen' && <ImagePlus size={18} aria-hidden="true" />}
          <span>{variant === 'screen' ? 'Jatuhkan gambar di sini' : 'Tanpa artwork'}</span>
        </div>
      )}

      <div className="sc-badges">
        <span className="sc-badge">{shortLevel(spell.level)}</span>
        <span className="sc-badge">{spell.school}</span>
      </div>

      <div className="sc-overlay">
        <div>
          <h3 className="sc-title">{spell.name}</h3>
          <p className="sc-subtitle">{spell.classes.join(' · ') || 'Tanpa class'}</p>
        </div>

        {(spell.summary || visibleLines.length > 0) && (
          <div className="sc-box">
            {spell.summary && <p className="sc-summary">{spell.summary}</p>}

            {visibleLines.length > 0 && (
              <ul className="sc-effects">
                {visibleLines.map((line, index) => (
                  <li key={`${line.tone}-${index}`}>
                    <span className={`sc-effect-text sc-effect-${line.tone}`}>
                      {line.label ? `${line.label}: ${line.text}` : line.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {hiddenCount > 0 && <p className="sc-more">+{hiddenCount} efek lain</p>}
          </div>
        )}

        {tags.length > 0 && (
          <div className="sc-tags">
            {tags.map((tag) => (
              <span key={tag.text} className={`sc-tag sc-tag-${tag.tone}`}>
                {tag.text}
              </span>
            ))}
          </div>
        )}

        <dl className="sc-footer">
          <div>
            <dt>Cast</dt> <dd>{spell.castingTime}</dd>
          </div>
          <div>
            <dt>Range</dt> <dd>{spell.range}</dd>
          </div>
          <div>
            <dt>Durasi</dt> <dd>{spell.duration}</dd>
          </div>
          <div>
            <dt>Komp</dt> <dd>{spell.components}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

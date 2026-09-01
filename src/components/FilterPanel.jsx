import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { SCHOOLS, CLASSES, LEVEL_OPTIONS, SORTS } from '../lib/spells';
import { SCHOOL_ID, CLASS_ID } from '../lib/id';

const FIELD_CLASS =
  'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 ' +
  'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500';

const LABEL_CLASS = 'text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1';

function Field({ id, label, children }) {
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function FilterPanel({ filters, onChange, onReset, resultCount, totalCount }) {
  const set = (key) => (event) => onChange({ ...filters, [key]: event.target.value });
  const isFiltered =
    filters.query !== '' || filters.school !== 'All' || filters.level !== 'All' || filters.klass !== 'All';

  return (
    <aside className="w-full lg:w-72 lg:shrink-0 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 h-fit lg:sticky lg:top-24">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
        <SlidersHorizontal size={14} className="text-purple-400" aria-hidden="true" />
        <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400">Filter</h2>
      </div>

      <div className="space-y-4">
        <Field id="filter-search" label="Cari spell">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="filter-search"
              type="search"
              placeholder="Fireball, heal, acid…"
              value={filters.query}
              onChange={set('query')}
              className={`${FIELD_CLASS} pl-9`}
            />
          </div>
        </Field>

        <Field id="filter-school" label="School">
          <select id="filter-school" value={filters.school} onChange={set('school')} className={FIELD_CLASS}>
            <option value="All">Semua school</option>
            {SCHOOLS.map((school) => (
              <option key={school} value={school}>
                {school} — {SCHOOL_ID[school].name}
              </option>
            ))}
          </select>
        </Field>

        <Field id="filter-level" label="Level">
          <select id="filter-level" value={filters.level} onChange={set('level')} className={FIELD_CLASS}>
            <option value="All">Semua level</option>
            {LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="filter-class" label="Class">
          <select id="filter-class" value={filters.klass} onChange={set('klass')} className={FIELD_CLASS}>
            <option value="All">Semua class</option>
            {CLASSES.map((klass) => (
              <option key={klass} value={klass}>
                {klass} — {CLASS_ID[klass]}
              </option>
            ))}
          </select>
        </Field>

        <Field id="filter-sort" label="Urutkan">
          <select id="filter-sort" value={filters.sort} onChange={set('sort')} className={FIELD_CLASS}>
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <p className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400" aria-live="polite">
        Menampilkan <span className="font-bold text-purple-300">{resultCount}</span> dari {totalCount} spell
      </p>

      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <X size={14} aria-hidden="true" />
          Reset filter
        </button>
      )}
    </aside>
  );
}

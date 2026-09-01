import React, { useCallback, useMemo, useRef, useState } from 'react';
import { BookOpen, Printer, Sparkles } from 'lucide-react';

import rawSpells from './data/spells-card.json';
import { normalizeSpells, filterSpells } from './lib/spells';
import { loadArtwork, saveArtwork } from './lib/storage';
import { prepareArtwork } from './lib/image';
import { clampTransform, layoutFor, DEFAULT_LAYOUT, DEFAULT_TRANSFORM, LAYOUTS } from './lib/artwork';
import { useFitCards } from './hooks/useFitCards';

import FilterPanel from './components/FilterPanel';
import ArtPositionEditor from './components/ArtPositionEditor';
import GuideDialog from './components/GuideDialog';
import PrintQueue from './components/PrintQueue';
import PrintSheet from './components/PrintSheet';
import SpellDetailDialog from './components/SpellDetailDialog';
import SpellTile from './components/SpellTile';
import Toast from './components/Toast';

import './styles/card.css';
import './print.css';

const SPELLS = normalizeSpells(rawSpells);

const DEFAULT_FILTERS = {
  query: '',
  school: 'All',
  level: 'All',
  klass: 'All',
  sort: 'name',
};

/** crypto.randomUUID hanya tersedia di secure context; sediakan cadangannya. */
function newInstanceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `card-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  // Artwork disimpan terpisah dari data spell (peta spellId -> data URL) supaya
  // daftar spell tetap tidak berubah dan mudah di-memo.
  const [artwork, setArtwork] = useState(loadArtwork);
  const [queue, setQueue] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [detailSpell, setDetailSpell] = useState(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [editingSpell, setEditingSpell] = useState(null);
  const [globalLayout, setGlobalLayout] = useState(DEFAULT_LAYOUT);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, tone = 'success') => {
    setToast({ message, tone, id: Date.now() });
  }, []);

  const spells = useMemo(
    () => SPELLS.map((spell) => (artwork[spell.id] ? { ...spell, artwork: artwork[spell.id] } : spell)),
    [artwork],
  );

  const visibleSpells = useMemo(() => filterSpells(spells, filters), [spells, filters]);

  // Ukuran teks tiap kartu diukur ulang setiap daftar yang tampil berubah.
  const gridRef = useFitCards(visibleSpells);

  const counts = useMemo(() => {
    const map = new Map();
    for (const card of queue) {
      map.set(card.id, (map.get(card.id) ?? 0) + 1);
    }
    return map;
  }, [queue]);

  // Antrean menyimpan salinan spell, jadi artwork yang baru dipasang harus
  // ikut menyegarkan kartu yang sudah masuk antrean.
  const queueCards = useMemo(
    () => queue.map((card) => (artwork[card.id] ? { ...card, artwork: artwork[card.id] } : card)),
    [queue, artwork],
  );

  /**
   * Cermin state artwork yang selalu mutakhir.
   *
   * State React baru terlihat pada render berikutnya, sehingga dua perubahan
   * beruntun dalam satu tick — misalnya menahan tombol panah — akan sama-sama
   * membaca nilai lama dan saling menimpa. Ref ini diperbarui serentak dengan
   * setState, jadi setiap perubahan selalu bertumpu pada hasil sebelumnya.
   *
   * Semua penulisan artwork wajib lewat updateArtwork agar cerminnya tidak
   * pernah menyimpang dari state.
   */
  const artworkRef = useRef(artwork);

  const updateArtwork = useCallback(
    (updater, pesanSukses) => {
      const next = updater(artworkRef.current);
      if (next === artworkRef.current) return;

      artworkRef.current = next;
      setArtwork(next);

      const result = saveArtwork(next);
      if (!result.ok) {
        notify(
          result.reason === 'quota'
            ? 'Penyimpanan browser penuh — perubahan ini hanya bertahan sampai halaman ditutup.'
            : 'Browser memblokir penyimpanan lokal, perubahan tidak tersimpan permanen.',
          'error',
        );
      } else if (pesanSukses) {
        notify(pesanSukses);
      }
    },
    [notify],
  );

  const handleArtwork = useCallback(
    async (spellId, file) => {
      try {
        const art = await prepareArtwork(file);
        updateArtwork(
          (prev) => ({
            // Gambar baru selalu mulai dari posisi tengah, tapi pilihan tata
            // letak kartu itu dipertahankan.
            ...prev,
            [spellId]: { art, ...DEFAULT_TRANSFORM, layout: prev[spellId]?.layout ?? null },
          }),
          'Artwork terpasang.',
        );
      } catch (err) {
        notify(err.message, 'error');
      }
    },
    [notify, updateArtwork],
  );

  /**
   * Menerima perubahan sebagian. Patch boleh berupa objek (nilai mutlak, dipakai
   * saat menggeser dan menggeser slider) atau fungsi dari posisi saat ini
   * (perubahan relatif, dipakai tombol panah).
   */
  const handleArtChange = useCallback(
    (spellId, patch) => {
      updateArtwork((prev) => {
        const current = prev[spellId];
        const resolved = typeof patch === 'function' ? patch(clampTransform(current)) : patch;

        // Tata letak boleh dipilih walau kartunya belum punya gambar.
        if (!current && !('layout' in resolved)) return prev;

        const next = current
          ? {
              ...current,
              ...clampTransform({ ...current, ...resolved }),
              layout: resolved.layout ?? current.layout,
            }
          : { art: '', ...DEFAULT_TRANSFORM, layout: resolved.layout };

        return { ...prev, [spellId]: next };
      });
    },
    [updateArtwork],
  );

  const handleArtReset = useCallback(
    (spellId) => {
      updateArtwork(
        (prev) => (prev[spellId] ? { ...prev, [spellId]: { ...prev[spellId], ...DEFAULT_TRANSFORM } } : prev),
        'Posisi dikembalikan ke tengah.',
      );
    },
    [updateArtwork],
  );

  const handleClearArtwork = useCallback(
    (spellId) => {
      updateArtwork((prev) => {
        if (!prev[spellId]) return prev;
        const next = { ...prev };
        delete next[spellId];
        return next;
      }, 'Artwork dihapus.');
    },
    [updateArtwork],
  );

  const handleAdd = useCallback((spell) => {
    setQueue((prev) => [...prev, { ...spell, instanceId: newInstanceId() }]);
  }, []);

  const handleRemoveOne = useCallback((spellId) => {
    setQueue((prev) => {
      const index = prev.findLastIndex((card) => card.id === spellId);
      if (index === -1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleRemoveAt = useCallback((index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handlePrint = useCallback(() => {
    setQueueOpen(false);
    // Beri React satu frame untuk menutup panel sebelum dialog cetak muncul.
    requestAnimationFrame(() => window.print());
  }, []);

  return (
    <div className="app-shell min-h-screen bg-slate-900 text-white">
      <header className="screen-only sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-4 sm:px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-600 p-2">
              <Sparkles size={22} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-base font-black uppercase tracking-wider sm:text-lg">
                DnD Spellcard Generator
              </h1>
              <p className="text-xs text-slate-400">Kartu spell 63 × 88 mm siap cetak</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="hidden items-center rounded-xl border border-slate-700 p-0.5 sm:flex"
              role="group"
              aria-label="Tata letak kartu bawaan"
            >
              {Object.entries(LAYOUTS).map(([id, { label, hint }]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGlobalLayout(id)}
                  aria-pressed={globalLayout === id}
                  title={hint}
                  className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    globalLayout === id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <BookOpen size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Panduan</span>
            </button>

            <button
              type="button"
              onClick={() => setQueueOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <Printer size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Antrean</span>
              <span className="rounded-full bg-slate-950/40 px-2 py-0.5 tabular-nums">{queue.length}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="screen-only mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:flex-row">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
          resultCount={visibleSpells.length}
          totalCount={SPELLS.length}
        />

        <section className="flex-1" aria-label="Daftar spell">
          {visibleSpells.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-24 text-center text-slate-400">
              <p className="text-lg font-semibold">Tidak ada spell yang cocok.</p>
              <p className="mt-1 text-sm">Coba ubah kata kunci atau longgarkan filternya.</p>
            </div>
          ) : (
            <div
              ref={gridRef}
              className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-3"
            >
              {visibleSpells.map((spell) => (
                <SpellTile
                  key={spell.id}
                  spell={spell}
                  count={counts.get(spell.id) ?? 0}
                  layout={layoutFor(spell.artwork, globalLayout)}
                  onAdd={handleAdd}
                  onRemove={handleRemoveOne}
                  onArtwork={handleArtwork}
                  onClearArtwork={handleClearArtwork}
                  onShowDetail={setDetailSpell}
                  onEditArt={setEditingSpell}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <PrintQueue
        open={queueOpen}
        cards={queueCards}
        onClose={() => setQueueOpen(false)}
        onRemoveAt={handleRemoveAt}
        onClear={() => setQueue([])}
        onPrint={handlePrint}
        onOpenGuide={() => {
          setQueueOpen(false);
          setGuideOpen(true);
        }}
      />

      <GuideDialog open={guideOpen} onClose={() => setGuideOpen(false)} />

      {editingSpell && (
        <ArtPositionEditor
          spell={editingSpell}
          entry={artwork[editingSpell.id] ?? null}
          globalLayout={globalLayout}
          onChange={(patch) => handleArtChange(editingSpell.id, patch)}
          onReset={() => handleArtReset(editingSpell.id)}
          onClose={() => setEditingSpell(null)}
        />
      )}

      <SpellDetailDialog spell={detailSpell} onClose={() => setDetailSpell(null)} />
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <PrintSheet cards={queueCards} globalLayout={globalLayout} />
    </div>
  );
}

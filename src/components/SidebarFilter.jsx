import React from 'react';
import { Search, FileText, Sparkles } from 'lucide-react';

const CLASS_OPTIONS = ['All', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'];
const LEVEL_OPTIONS = ['All', 'Cantrip', '1st Level', '2nd Level', '3rd Level', '4th Level', '5th Level', '6th Level', '7th Level', '8th Level', '9th Level'];

export default function SidebarFilter({
  search, setSearch,
  selectedClass, setSelectedClass,
  selectedLevel, setSelectedLevel,
  selectedSpells, selectedCount,
  onRemoveItem,
  onExportPDF
}) {
  return (
    <aside className="w-80 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between h-full shrink-0">
      <div className="space-y-6 overflow-y-auto flex-1 pr-1">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              SPELL CARD
            </h2>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Generator v1.0</span>
          </div>
        </div>

        {/* Input Cari */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase">Cari Spell</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Misal: Fireball..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Filter Class */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {CLASS_OPTIONS.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
          </select>
        </div>

        {/* Filter Level */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase">Spell Level</label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {LEVEL_OPTIONS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
        </div>

        {/* LIST ANTREAN GRID (Bisa duplikat nama spell) */}
        {selectedCount > 0 && (
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Daftar Antrean Grid:</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {selectedSpells.map((spellId, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-slate-900 px-2 py-1.5 rounded border border-slate-800">
                  <span className="truncate max-w-[180px] text-slate-300">{idx + 1}. {spellId}</span>
                  <button 
                    onClick={() => onRemoveItem(idx)} 
                    className="text-red-400 hover:text-red-300 font-bold px-1 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tombol Cetak Dokumen */}
      <div className="border-t border-slate-800 pt-4 space-y-3 bg-slate-950">
        <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
          <span>Total Kartu Di Grid:</span>
          <span className="text-purple-400 font-bold">{selectedCount} Kartu</span>
        </div>
        <button
          onClick={onExportPDF}
          disabled={selectedCount === 0}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <FileText size={16} />
          Export PDF (A4 Grid)
        </button>
      </div>
    </aside>
  );
}
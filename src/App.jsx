import React, { useState } from 'react';
import spellsData from './data/spells-card.json';
import {
  Sparkles,
  Printer,
  SlidersHorizontal
} from 'lucide-react';

import './print.css';

export default function App() {

  // State utama untuk menampung data spell kustom (termasuk gambar)
  const [spells, setSpells] = useState(() => {
    const savedCustomData = localStorage.getItem('dnd_custom_spells');
    if (savedCustomData) {
      const parsedData = JSON.parse(savedCustomData);
      return spellsData.map((srdSpell) => {
        const custom = parsedData.find(c => c.id === srdSpell.id);
        return custom ? { ...srdSpell, ...custom } : srdSpell;
      });
    }
    return spellsData;
  });

  const [selectedSpells, setSelectedSpells] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('All');

  const schools = [
    'All', 'Abjuration', 'Conjuration', 'Divination', 
    'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'
  ];

  // Helper untuk merapikan penulisan tingkatan level (1th -> 1st, 2th -> 2nd)
  const formatLevel = (levelStr) => {
    if (!levelStr) return '';
    return levelStr
      .replace(/1th/i, '1st')
      .replace(/2th/i, '2nd')
      .replace(/3th/i, '3rd');
  };

  // Fungsi Drag & Drop Gambar dengan FileReader (Base64) + Simpan LocalStorage
  const handleImageDrop = (e, spellId) => {
    e.preventDefault();
    
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Mohon jatuhkan file berupa gambar!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;

      // Update gambar di grid utama
      setSpells((prevSpells) =>
        prevSpells.map((s) =>
          s.id === spellId ? { ...s, customArt: base64Image } : s
        )
      );

      // Update gambar di antrean cetak jika sudah ditambahkan sebelumnya
      setSelectedSpells((prevSelected) =>
        prevSelected.map((s) =>
          s.id === spellId ? { ...s, customArt: base64Image } : s
        )
      );

      // Simpan permanen ke LocalStorage
      const savedCustomData = localStorage.getItem('dnd_custom_spells');
      let currentCustom = savedCustomData ? JSON.parse(savedCustomData) : [];
      
      currentCustom = currentCustom.filter((c) => c.id !== spellId);
      currentCustom.push({ id: spellId, customArt: base64Image });
      
      localStorage.setItem('dnd_custom_spells', JSON.stringify(currentCustom));
    };
    
    reader.readAsDataURL(file);
  };

  const handleAddCard = (spell) => {
    setSelectedSpells((prev) => [
      ...prev,
      { ...spell, instanceId: crypto.randomUUID() }
    ]);
  };

  const handleRemoveCard = (spellId) => {
    setSelectedSpells((prev) => {
      const index = prev.findIndex(card => card.id === spellId);
      if (index === -1) return prev;
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const getCardCount = (spellId) => {
    return selectedSpells.filter(s => s.id === spellId).length;
  };

  const handleExport = () => {
    if (selectedSpells.length === 0) {
      alert('Pilih minimal satu kartu!');
      return;
    }
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const filteredSpells = spells.filter((spell) => {
    const matchesSearch =
      spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spell.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spell.card_data?.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spell.card_data?.effects?.join(' ').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSchool = selectedSchool === 'All' || spell.school === selectedSchool;
    return matchesSearch && matchesSchool;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white print:bg-transparent print:text-white">
      
      {/* FORCE BROWSER UNTUK TETAP RENDERING WARNA GELAP SAAT PRINT */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background-color: transparent !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-xl">
              <Sparkles size={22} />
            </div>
            <div>
              <h1 className="font-black text-lg uppercase tracking-wider">DnD Spellcard Generator</h1>
              <p className="text-xs text-slate-400">Tactical Spell Cards</p>
            </div>
          </div>

          <button
            onClick={handleExport}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              selectedSpells.length > 0
                ? 'bg-purple-600 hover:bg-purple-500'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Printer size={16} />
            Print ({selectedSpells.length})
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-6 print:hidden">

        {/* SIDEBAR CONTROL */}
        <aside className="w-full lg:w-64 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 h-fit sticky top-24">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
            <SlidersHorizontal size={14} className="text-purple-400" />
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400">Control Panel</h2>
          </div>

          {/* SEARCH */}
          <div className="mb-4">
            <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Cari Spell</label>
            <input
              type="text"
              placeholder="Fire, Heal, Acid..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* SCHOOL FILTER */}
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">School</label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
            >
              {schools.map((school) => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* CARDS GRID AREA */}
        <section className="flex-1">
          {filteredSpells.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
              {filteredSpells.map((spell) => {
                const count = getCardCount(spell.id);

                return (
                  <div
                    key={spell.id}
                    className="relative rounded-2xl overflow-hidden border-2 border-slate-700 w-[240px] h-[336px] flex flex-col justify-end transition-all duration-300 hover:scale-[1.02] hover:border-purple-400 shadow-xl bg-slate-900 cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleImageDrop(e, spell.id)}
                  >
                    {/* IMAGE BACKGROUND */}
                    {spell.customArt ? (
                      <img
                        src={spell.customArt}
                        alt={spell.name}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-slate-800 z-0 flex items-center justify-center text-[10px] text-slate-500 border-2 border-dashed border-slate-700 m-2 rounded-xl text-center p-4">
                        Drop Artwork Image Here
                      </div>
                    )}

                    {/* CONTENT OVERLAY */}
                    <div className="absolute inset-0 z-10 w-full flex flex-col justify-end p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                      
                      {/* TITLE */}
                      <div className="mb-1">
                        <h2 className="text-sm font-black uppercase leading-none tracking-wide text-white drop-shadow-md">
                          {spell.name}
                        </h2>
                        <p className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mt-0.5">
                          {formatLevel(spell.level)} • {spell.school}
                        </p>
                      </div>

                      {/* EFFECT BOX */}
                      <div className="bg-slate-950/90 backdrop-blur-sm rounded-xl p-2 border border-slate-800/80">
                        {spell.card_data?.summary && (
                          <p className="text-[10px] font-bold mb-1 text-slate-200 leading-tight border-b border-slate-800/60 pb-0.5">
                            {spell.card_data.summary}
                          </p>
                        )}

                        <ul className="text-[9px] text-slate-300 space-y-0.5 leading-tight">
                          {spell.card_data?.damage?.map((dmg, idx) => (
                            <li key={`dmg-${idx}`} className="text-red-400 font-medium">• Dmg: {dmg}</li>
                          ))}
                          {spell.card_data?.healing?.map((heal, idx) => (
                            <li key={`heal-${idx}`} className="text-green-400 font-medium">• Heal: {heal}</li>
                          ))}
                          {spell.card_data?.aoe && (
                            <li className="text-amber-400 font-medium">• Area: {spell.card_data.aoe}</li>
                          )}
                          {spell.card_data?.effects?.map((effect, idx) => (
                            <li key={`effect-${idx}`} className="break-words">• {effect}</li>
                          ))}
                        </ul>
                      </div>

                      {/* FOOTER */}
                      <div className="mt-1.5 text-[8.5px] text-slate-400 flex flex-col leading-none gap-0.5 font-medium pr-14">
                        <span>Cast: {spell.casting_time}</span>
                        <span>Range: {spell.range}</span>
                        <span>Duration: {spell.duration}</span>
                      </div>
                    </div>

                    {/* COUNTER */}
                    {count > 0 && (
                      <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCard(spell.id);
                          }}
                          className="w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center justify-center"
                        >
                          -
                        </button>
                        <div className="min-w-[20px] h-5 px-1 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-black">
                          {count}
                        </div>
                      </div>
                    )}

                    {/* ADD BUTTON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddCard(spell);
                      }}
                      className="absolute bottom-2.5 right-2.5 z-20 bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider"
                    >
                      Add
                    </button>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-20">Spell tidak ditemukan.</div>
          )}
        </section>
      </main>

      {/* PRINT AREA (100% SAMA DENGAN GRID, DIATUR DALAM GRID KHUSUS CETAK) */}
      <div id="print-pdf-area" className="hidden print:grid print:grid-cols-3 print:gap-4 print:p-4 justify-items-center bg-transparent">
        {selectedSpells.map((spell) => (
          <div 
            key={spell.instanceId} 
            className="relative rounded-2xl overflow-hidden border-2 border-slate-700 w-[240px] h-[336px] flex flex-col justify-end bg-slate-900 print:break-inside-avoid"
          >
            {/* IMAGE BACKGROUND */}
            {spell.customArt ? (
              <img
                src={spell.customArt}
                alt={spell.name}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            ) : (
              <div className="absolute inset-0 bg-slate-800 z-0 flex items-center justify-center text-[10px] text-slate-500 border-2 border-dashed border-slate-700 m-2 rounded-xl text-center p-4">
                No Image
              </div>
            )}

            {/* CONTENT OVERLAY */}
            <div className="absolute inset-0 z-10 w-full flex flex-col justify-end p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
              
              {/* TITLE */}
              <div className="mb-1">
                <h2 className="text-sm font-black uppercase leading-none tracking-wide text-white">
                  {spell.name}
                </h2>
                <p className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mt-0.5">
                  {formatLevel(spell.level)} • {spell.school}
                </p>
              </div>

              {/* EFFECT BOX */}
              <div className="bg-slate-950/90 rounded-xl p-2 border border-slate-800/80">
                {spell.card_data?.summary && (
                  <p className="text-[10px] font-bold mb-1 text-slate-200 leading-tight border-b border-slate-800/60 pb-0.5">
                    {spell.card_data.summary}
                  </p>
                )}

                <ul className="text-[9px] text-slate-300 space-y-0.5 leading-tight">
                  {spell.card_data?.damage?.map((dmg, idx) => (
                    <li key={`print-dmg-${idx}`} className="text-red-400 font-medium">• Dmg: {dmg}</li>
                  ))}
                  {spell.card_data?.healing?.map((heal, idx) => (
                    <li key={`print-heal-${idx}`} className="text-green-400 font-medium">• Heal: {heal}</li>
                  ))}
                  {spell.card_data?.aoe && (
                    <li className="text-amber-400 font-medium">• Area: {spell.card_data.aoe}</li>
                  )}
                  {spell.card_data?.effects?.map((effect, idx) => (
                    <li key={`print-effect-${idx}`} className="break-words">• {effect}</li>
                  ))}
                </ul>
              </div>

              {/* FOOTER */}
              <div className="mt-1.5 text-[8.5px] text-slate-400 flex flex-col leading-none gap-0.5 font-medium">
                <span>Cast: {spell.casting_time}</span>
                <span>Range: {spell.range}</span>
                <span>Duration: {spell.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
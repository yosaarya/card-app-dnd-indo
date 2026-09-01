import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { SCHOOL_ID, CLASS_ID, DAMAGE_TYPE_PAIRS } from '../lib/id';

const TABS = [
  { id: 'app', label: 'Pakai aplikasi' },
  { id: 'print', label: 'Cetak' },
  { id: 'card', label: 'Baca kartu' },
  { id: 'terms', label: 'Istilah' },
];

const APP_STEPS = [
  [
    'Cari spell yang kamu butuhkan',
    'Ketik namanya di kotak Cari, atau saring lewat School, Level, dan Class. Kolom pencarian juga menelusuri isi deskripsi, jadi kata seperti "racun" atau "terbang" tetap ketemu.',
  ],
  [
    'Pasang gambar (opsional)',
    'Seret berkas gambar ke atas kartu, atau tekan tombol unggah di bawah kartu. Gambar otomatis dipotong ke bentuk kartu dan disimpan di browser ini.',
  ],
  [
    'Masukkan ke antrean cetak',
    'Tekan tombol + di bawah kartu. Tekan berkali-kali kalau kamu mau beberapa salinan kartu yang sama.',
  ],
  [
    'Cetak',
    'Buka panel Antrean di kanan atas, periksa daftarnya, lalu tekan Cetak. Ikuti pengaturan di tab Cetak.',
  ],
];

const PRINT_SETTINGS = [
  ['Ukuran kertas', 'A4, orientasi Portrait (tegak).'],
  ['Margin', 'None atau 0. Kalau tidak, kartu akan mengecil dan ukurannya meleset.'],
  ['Background graphics', 'Harus dicentang, kalau tidak latar gelap kartu tidak ikut tercetak.'],
  ['Scale / Skala', 'Biarkan 100%, jangan "Fit to page".'],
];

const CARD_PARTS = [
  [
    'Lencana di kanan atas',
    'Level spell. "Cantrip" berarti bisa dipakai sesering apa pun tanpa menghabiskan spell slot.',
  ],
  ['Baris di bawah gambar', 'School sihirnya, lalu daftar class yang bisa memakai spell ini.'],
  [
    'Cara pakai',
    'Urutan yang kamu lakukan di meja, dari menghabiskan aksi sampai efeknya berlaku. Ikuti nomornya dari atas.',
  ],
  ['Tanda ›', 'Catatan tambahan di luar urutan langkah.'],
  [
    'Bilah bawah',
    'Waktu merapal, jarak jangkauan, berapa lama bertahan, dan apa yang kamu butuhkan untuk merapalnya.',
  ],
];

const GLOSSARY = [
  ['Spell slot', 'Jatah merapal sihir per hari. Cantrip tidak memakainya.'],
  ['Aksi (action)', 'Satu giliranmu biasanya berisi satu aksi, satu aksi bonus, dan gerakan.'],
  ['Reaksi (reaction)', 'Respons cepat di luar giliranmu, satu kali per ronde.'],
  ['AC', 'Armor Class — angka yang harus dilampaui lemparan seranganmu.'],
  ['Saving throw / save', 'Lemparan d20 yang dilakukan sasaran untuk menghindar atau bertahan.'],
  [
    'DC sihirmu',
    '8 + bonus proficiency + modifier ability sihirmu. Angka yang harus dicapai sasaran saat save.',
  ],
  [
    'Modifier sihir',
    'Modifier ability yang dipakai class-mu: INT untuk Wizard, WIS untuk Cleric dan Druid, CHA untuk Bard, Sorcerer, Warlock, dan Paladin.',
  ],
  ['Proficiency', 'Bonus yang naik seiring level karaktermu (+2 di level 1).'],
  [
    'Konsentrasi',
    'Hanya satu spell konsentrasi yang boleh aktif. Kena damage berarti lempar save CON DC 10 atau sihirnya buyar.',
  ],
  ['Ritual', 'Merapal tanpa memakai spell slot, tapi butuh tambahan 10 menit.'],
  ['Focus sihir', 'Tongkat, kristal, atau simbol suci yang menggantikan bahan biasa.'],
  [
    'Advantage / Disadvantage',
    'Lempar dua d20, ambil yang lebih besar (advantage) atau lebih kecil (disadvantage).',
  ],
  ['Kotak', '1 kotak di peta = 5 kaki. Jarak "30 kaki" berarti 6 kotak.'],
];

function Section({ title, children }) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="mb-2 text-[11px] font-black uppercase tracking-widest text-purple-300">{title}</h3>
      {children}
    </div>
  );
}

function DefinitionList({ items }) {
  return (
    <dl className="space-y-2">
      {items.map(([term, detail]) => (
        <div key={term} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <dt className="text-sm font-bold text-slate-100">{term}</dt>
          <dd className="mt-0.5 text-sm leading-relaxed text-slate-400">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Panduan pemakaian, sengaja disembunyikan di balik tombol agar tidak mengganggu. */
export default function GuideDialog({ open, onClose }) {
  const [tab, setTab] = useState('app');
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="screen-only fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-800 p-5 pb-4">
          <div>
            <h2 id="guide-title" className="text-lg font-black uppercase tracking-wide">
              Panduan
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Untuk yang baru pertama kali main D&amp;D atau baru buka aplikasi ini.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Tutup panduan"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-800 px-5 py-2" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                tab === item.id
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'app' && (
            <Section title="Empat langkah">
              <ol className="space-y-2">
                {APP_STEPS.map(([title, detail], index) => (
                  <li
                    key={title}
                    className="flex gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                  >
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-purple-600 text-xs font-black">
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-100">{title}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-slate-400">{detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {tab === 'print' && (
            <>
              <Section title="Pengaturan di dialog cetak browser">
                <DefinitionList items={PRINT_SETTINGS} />
              </Section>
              <Section title="Setelah tercetak">
                <p className="text-sm leading-relaxed text-slate-400">
                  Setiap halaman A4 memuat 9 kartu berukuran 63 × 88 mm — sama dengan kartu permainan pada
                  umumnya, jadi muat di card sleeve biasa. Potong mengikuti tanda sudut yang tercetak di
                  sekeliling tiap kartu. Kalau ingin lebih awet, cetak di kertas 200–250 gsm.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Ingin menyimpannya sebagai berkas? Di dialog cetak, pilih tujuan{' '}
                  <span className="font-semibold text-slate-200">Save as PDF</span> alih-alih nama printer.
                </p>
              </Section>
            </>
          )}

          {tab === 'card' && (
            <Section title="Bagian-bagian kartu">
              <DefinitionList items={CARD_PARTS} />
            </Section>
          )}

          {tab === 'terms' && (
            <>
              <Section title="Istilah dasar">
                <DefinitionList items={GLOSSARY} />
              </Section>

              <Section title="School sihir">
                <dl className="space-y-1.5">
                  {Object.entries(SCHOOL_ID).map(([english, { name, gloss }]) => (
                    <div key={english} className="flex flex-wrap gap-x-2 text-sm">
                      <dt className="font-bold text-slate-200">{english}</dt>
                      <dd className="text-slate-400">
                        {name} — {gloss}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Section>

              <Section title="Class">
                <dl className="space-y-1.5">
                  {Object.entries(CLASS_ID).map(([english, gloss]) => (
                    <div key={english} className="flex flex-wrap gap-x-2 text-sm">
                      <dt className="font-bold text-slate-200">{english}</dt>
                      <dd className="text-slate-400">{gloss}</dd>
                    </div>
                  ))}
                </dl>
              </Section>

              <Section title="Jenis damage">
                <p className="text-sm leading-relaxed text-slate-400">
                  Kartu memakai nama Indonesia; stat block monster memakai nama Inggrisnya.
                </p>
                <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                  {DAMAGE_TYPE_PAIRS.map(([english, indonesian]) => (
                    <li key={english} className="text-slate-400">
                      <span className="font-semibold text-slate-200">{indonesian}</span> = {english}
                    </li>
                  ))}
                </ul>
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

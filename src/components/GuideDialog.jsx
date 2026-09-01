import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { SCHOOL_ID, CLASS_ID, DAMAGE_TYPE_PAIRS } from '../lib/id';
import { ringkasanWaktuMerapal, ringkasanDurasi, hitungKonsentrasi, hitungRitual } from '../lib/timing';

const TABS = [
  { id: 'app', label: 'Pakai aplikasi' },
  { id: 'print', label: 'Cetak' },
  { id: 'card', label: 'Baca kartu' },
  { id: 'time', label: 'Waktu' },
  { id: 'terms', label: 'Istilah' },
];

const SATUAN_PERTEMPURAN = [
  [
    'Ronde',
    'Satu putaran giliran untuk semua orang di pertempuran. Lamanya 6 detik di dunia cerita, jadi 10 ronde = 1 menit.',
  ],
  [
    'Giliran',
    'Bagianmu di dalam sebuah ronde. Satu giliran berisi satu aksi, satu aksi bonus, dan gerakan — masing-masing sekali.',
  ],
  ['Aksi', 'Jatah utama giliranmu. Sebagian besar spell memakai ini, dan hanya satu aksi per giliran.'],
  [
    'Aksi bonus',
    'Jatah tambahan yang hanya bisa dipakai kalau ada sesuatu yang memberikannya. Tidak bisa dipakai untuk aksi biasa.',
  ],
  ['Reaksi', 'Respons di luar giliranmu, satu kali per ronde, dan hanya saat pemicunya terjadi.'],
];

const CATATAN_DURASI = [
  ['Seketika', 'Efeknya terjadi lalu selesai. Damage dan penyembuhan hampir selalu begini.'],
  [
    'Maks. sekian',
    'Bertahan paling lama segitu, tapi kamu boleh menghentikannya lebih awal. Hampir semuanya juga menuntut konsentrasi.',
  ],
  ['Durasi tetap', 'Bertahan penuh selama waktu yang tertulis, tidak bisa dihentikan sesukamu.'],
  ['Sampai dibubarkan', 'Bertahan terus sampai ada yang membubarkannya, misalnya dengan Dispel Magic.'],
];

const APP_STEPS = [
  [
    'Cari spell yang kamu butuhkan',
    'Ketik namanya di kotak Cari, atau saring lewat School, Level, dan Class. Kolom pencarian juga menelusuri isi deskripsi, jadi kata seperti "racun" atau "terbang" tetap ketemu.',
  ],
  [
    'Pasang gambar (opsional)',
    'Seret berkas gambar ke atas kartu, atau tekan tombol unggah di bawah kartu. Gambar disimpan di browser ini.',
  ],
  [
    'Atur tampilannya (opsional)',
    'Tombol bergambar bingkai potong membuka pengatur posisi: seret gambarnya, perbesar, dan pilih tata letak Bingkai atau Full-art untuk kartu itu.',
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

const LAYOUT_NOTES = [
  [
    'Bingkai',
    'Gambar punya jendela sendiri dan teks aturan berada di atas latar solid. Paling terbaca, dan aman untuk semua spell.',
  ],
  [
    'Full-art',
    'Gambar memenuhi kartu dan teks menumpang di atasnya. Terlihat paling bagus pada spell berketerangan pendek — kartu yang langkahnya banyak akan tertutup kotak teks yang besar.',
  ],
  [
    'Mengatur posisi gambar',
    'Seret gambarnya di dalam pengatur, atau fokuskan kartunya lalu pakai tombol panah. Tanda + dan - mengatur perbesaran. Berguna untuk memindahkan bagian penting gambar ke area yang tidak tertutup teks.',
  ],
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
export default function GuideDialog({ open, onClose, spells }) {
  const [tab, setTab] = useState('app');
  const closeRef = useRef(null);

  useBodyScrollLock(open);

  // Dihitung dari data, bukan ditulis tangan, supaya panduan tidak pernah
  // berbeda dari isi aplikasi setelah datanya diperbarui.
  const { waktuMerapal, durasi, konsentrasi, ritual, totalSpell } = useMemo(
    () => ({
      waktuMerapal: ringkasanWaktuMerapal(spells),
      durasi: ringkasanDurasi(spells),
      konsentrasi: hitungKonsentrasi(spells),
      ritual: hitungRitual(spells),
      totalSpell: spells.length,
    }),
    [spells],
  );

  // Fokus dipasang terpisah dari listener: onClose berganti identitas tiap
  // render, jadi menggabungkannya membuat fokus direbut kembali ke tombol
  // tutup setiap kali aplikasi merender ulang.
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

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
        <header className="flex flex-none items-start justify-between gap-4 border-b border-slate-800 p-5 pb-4">
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

        <div
          className="flex flex-none gap-1 overflow-x-auto border-b border-slate-800 px-5 py-2"
          role="tablist"
        >
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
            <>
              <Section title="Bagian-bagian kartu">
                <DefinitionList items={CARD_PARTS} />
              </Section>
              <Section title="Dua pilihan tata letak">
                <DefinitionList items={LAYOUT_NOTES} />
              </Section>
            </>
          )}

          {tab === 'time' && (
            <>
              <Section title="Waktu di dalam pertempuran">
                <DefinitionList items={SATUAN_PERTEMPURAN} />
              </Section>

              <Section title="Berapa lama merapalnya">
                <p className="mb-2 text-sm leading-relaxed text-slate-400">
                  Angka di bawah dihitung dari {totalSpell} spell yang ada di aplikasi ini.
                </p>
                <ul className="space-y-1.5">
                  {waktuMerapal.map((baris) => (
                    <li
                      key={baris.label}
                      className="flex items-baseline gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm"
                    >
                      <span className="w-10 shrink-0 text-right font-bold tabular-nums text-purple-300">
                        {baris.jumlah}
                      </span>
                      <span className="font-semibold text-slate-200">{baris.label}</span>
                      {baris.diLuarPertempuran && (
                        <span className="ml-auto text-[11px] uppercase tracking-wider text-amber-400">
                          di luar pertempuran
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Yang bertanda <span className="font-semibold text-amber-400">di luar pertempuran</span>{' '}
                  butuh satu menit atau lebih. Satu ronde hanya 6 detik, jadi spell seperti itu tidak mungkin
                  dirapal di tengah perkelahian — pakai saat menyusun rencana atau beristirahat.
                </p>
              </Section>

              <Section title="Berapa lama efeknya bertahan">
                <DefinitionList items={CATATAN_DURASI} />
                <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['Seketika', durasi.seketika],
                    ['Maks. sekian', durasi.maksimal],
                    ['Durasi tetap', durasi.tetap],
                    ['Sampai dibubarkan', durasi.sampaiDibubarkan],
                  ].map(([label, jumlah]) => (
                    <li key={label} className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                      <span className="block font-bold tabular-nums text-purple-300">{jumlah}</span>
                      <span className="text-xs text-slate-400">{label}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Dua hal yang paling sering bikin bingung">
                <DefinitionList
                  items={[
                    [
                      `Konsentrasi (${konsentrasi} spell)`,
                      'Hanya satu spell konsentrasi yang boleh aktif. Merapal yang kedua langsung membatalkan yang pertama. Kena damage berarti lempar save CON dengan DC 10 atau separuh damage yang diterima, ambil yang lebih besar.',
                    ],
                    [
                      `Ritual (${ritual} spell)`,
                      'Boleh dirapal tanpa memakai spell slot, tapi butuh tambahan 10 menit. Berarti hanya bisa di luar pertempuran — tapi gratis, jadi pakai kalau tidak sedang buru-buru.',
                    ],
                  ]}
                />
              </Section>
            </>
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

# DnD Spellcard Generator

Aplikasi web untuk membuat dan mencetak kartu spell D&D 5e (SRD) berukuran
kartu permainan standar **63 × 88 mm**, ditujukan untuk pemain yang baru
belajar D&D.

- Kartu bergaya TCG: bilah judul dengan level, jendela artwork, baris school
  dan class, kotak aturan, lalu bilah kaki berisi waktu, jarak, durasi, dan
  kebutuhan merapal.
- Setiap kartu memuat **langkah "cara pakai"** berbahasa Indonesia yang
  diturunkan dari data spell — dari menghabiskan aksi, memilih sasaran,
  lemparan dadu yang dipakai, sampai efek dan cara menjaganya.
- Menelusuri 319 spell SRD dengan pencarian teks penuh serta filter school,
  level, dan class.
- Menempelkan artwork lewat drag & drop atau pemilih berkas; gambar otomatis
  dipotong ke rasio kartu, dikompres, lalu disimpan di browser.
- Menyusun antrean cetak (boleh rangkap) dan mencetaknya sebagai lembar A4
  berisi 3 × 3 kartu lengkap dengan tanda potong.
- Tombol **Panduan** berisi cara memakai aplikasi, pengaturan cetak,
  penjelasan bagian-bagian kartu, dan glosarium istilah D&D.

## Menjalankan

```bash
npm install
npm run dev        # server pengembangan
npm run build      # bundel produksi ke dist/
npm run preview    # meninjau hasil build
```

## Mencetak

Buka panel **Antrean** di kanan atas, lalu tekan *Cetak / simpan PDF*.
Di dialog cetak browser:

- ukuran kertas **A4**, orientasi **portrait**;
- margin **None / 0**;
- aktifkan **Background graphics** agar latar gelap kartu ikut tercetak.

Setiap halaman memuat 9 kartu berukuran tepat 63 × 88 mm, dengan tanda potong
di keempat sudutnya. Pengaturan ini juga tersedia di dalam aplikasi lewat
tombol Panduan → tab Cetak.

## Struktur

```
src/
  App.jsx                 komposisi state aplikasi
  components/
    SpellCard.jsx         satu kartu TCG; dipakai layar maupun cetak
    SpellTile.jsx         kartu + kontrol di grid
    FilterPanel.jsx       pencarian dan filter
    PrintQueue.jsx        panel antrean cetak
    PrintSheet.jsx        paginasi antrean menjadi halaman A4
    SpellDetailDialog.jsx keterangan lengkap satu spell
    GuideDialog.jsx       panduan aplikasi, cetak, dan glosarium
    Toast.jsx             notifikasi singkat
  hooks/
    useFitCards.js        memicu pengukuran ulang ukuran teks kartu
  lib/
    spells.js             normalisasi data, filter, urutan
    howto.js              menyusun langkah "cara pakai" dari data spell
    id.js                 pengalihbahasaan istilah D&D ke Indonesia
    fitCards.js           menurunkan ukuran teks kartu sampai isinya muat
    storage.js            localStorage yang tahan gagal
    image.js              pemotongan & kompresi artwork
    schools.js            warna aksen per school
  styles/card.css         bingkai kartu (dipakai layar & cetak)
  print.css               lembar A4 dan tanda potong
  data/
    spells-raw.json       hasil unduhan dnd5eapi.co
    spells-card.json      data siap kartu (dipakai aplikasi)
scripts/
  fetch-spells.js         mengunduh ulang spells-raw.json
  generate-card-data.py   menurunkan spells-card.json dari spells-raw.json
```

Kartu di layar dan kartu di kertas memakai komponen serta CSS yang sama;
yang berbeda hanya satuan ukurannya (`--sc-unit`: 10 px vs 2,625 mm),
sehingga pratinjau di layar sesuai dengan hasil cetak.

Panjang teks tiap spell sangat berbeda, jadi satu ukuran font tidak mungkin
pas untuk 319 kartu. `lib/fitCards.js` mengukur langsung dari DOM dan
menurunkan pengali `--sc-fit` tiap kartu sampai isinya muat. Karena yang
disetel pengali dan bukan ukuran mutlak, hasil pengukuran di layar tetap
berlaku saat dicetak.

## Memperbarui data spell

```bash
npm run data:fetch    # unduh ulang dari dnd5eapi.co -> src/data/spells-raw.json
npm run data:cards    # turunkan ringkasan kartu -> src/data/spells-card.json
```

`data:cards` membutuhkan Python 3.

## Catatan

- Artwork disimpan di `localStorage` browser, jadi hanya ada di perangkat
  yang dipakai. Bila kuota penyimpanan habis, aplikasi memberi tahu dan
  artwork tersebut hanya bertahan sampai halaman ditutup.
- Konten spell berasal dari SRD 5.1 (Wizards of the Coast, CC-BY-4.0)
  melalui [dnd5eapi.co](https://www.dnd5eapi.co).
- Nama school, class, dan istilah baku D&D (Save, DEX, Charmed, Beast,
  Disadvantage) sengaja dibiarkan dalam bahasa Inggris karena itulah yang
  tertulis di lembar karakter dan stat block monster. Semuanya dijelaskan di
  glosarium panduan.
- Deskripsi resmi SRD di dialog detail masih berbahasa Inggris dan ditandai
  sebagai teks asli; keterangan yang dipakai bermain sudah berbahasa
  Indonesia seluruhnya.

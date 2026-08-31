# DnD Spellcard Generator

Aplikasi web untuk membuat dan mencetak kartu spell D&D 5e (SRD) berukuran
kartu permainan standar **63 × 88 mm**, lengkap dengan artwork sendiri.

- Menelusuri 319 spell SRD dengan pencarian teks penuh serta filter school,
  level, dan class.
- Menempelkan artwork lewat drag & drop atau pemilih berkas; gambar otomatis
  dipotong ke rasio kartu, dikompres, lalu disimpan di browser.
- Menyusun antrean cetak (boleh rangkap) dan mencetaknya sebagai lembar A4
  berisi 3 × 3 kartu, siap dipotong.

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

Setiap halaman memuat 9 kartu berukuran tepat 63 × 88 mm.

## Struktur

```
src/
  App.jsx                 komposisi state aplikasi
  components/
    SpellCard.jsx         satu kartu; dipakai layar maupun cetak
    SpellTile.jsx         kartu + kontrol di grid
    FilterPanel.jsx       pencarian dan filter
    PrintQueue.jsx        panel antrean cetak
    PrintSheet.jsx        paginasi antrean menjadi halaman A4
    SpellDetailDialog.jsx deskripsi SRD lengkap
    Toast.jsx             notifikasi singkat
  lib/
    spells.js             normalisasi data, filter, urutan
    storage.js            localStorage yang tahan gagal
    image.js              pemotongan & kompresi artwork
    schools.js            warna aksen per school
  styles/card.css         tata letak kartu (dipakai layar & cetak)
  print.css               lembar A4
  data/
    spells-raw.json       hasil unduhan dnd5eapi.co
    spells-card.json      data siap kartu (dipakai aplikasi)
scripts/
  fetch-spells.js         mengunduh ulang spells-raw.json
  generate-card-data.py   menurunkan spells-card.json dari spells-raw.json
```

Kartu di layar dan kartu di kertas memakai komponen serta CSS yang sama;
yang berbeda hanya satuan ukurannya (piksel vs milimeter), sehingga
pratinjau di layar sesuai dengan hasil cetak.

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

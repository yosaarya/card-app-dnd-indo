/**
 * Memproses artwork yang di-drop pengguna sebelum disimpan.
 *
 * Foto mentah dari kamera bisa 5-10 MB dan langsung menghabiskan kuota
 * localStorage hanya dengan satu kartu, jadi gambar diperkecil dan dikompres
 * ke JPEG.
 *
 * Rasio aslinya sengaja dipertahankan: pemotongan ke bentuk kartu dilakukan
 * saat render supaya pengguna masih bisa menggeser dan memperbesar gambarnya.
 * Kalau dipotong sejak di sini, tidak ada sisa gambar yang bisa digeser.
 *
 * Sisi terpanjang 900 px setara sekitar 360 dpi pada kartu 63 mm — masih
 * tajam untuk dicetak.
 */

const MAX_EDGE = 900;
const JPEG_QUALITY = 0.82;

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Gambar gagal dibaca.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Format gambar tidak dikenali.'));
    img.src = dataUrl;
  });
}

/**
 * @param {File} file
 * @returns {Promise<string>} data URL JPEG seukuran kartu
 */
export async function prepareArtwork(file) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('File yang dijatuhkan bukan gambar.');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Gambar terlalu besar (maksimal 20 MB).');
  }

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  // Gambar yang sudah kecil tidak perlu diperbesar.
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl; // fallback: pakai gambar asli

  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

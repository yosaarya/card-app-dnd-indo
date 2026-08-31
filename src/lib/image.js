/**
 * Memproses artwork yang di-drop pengguna sebelum disimpan.
 *
 * Foto mentah dari kamera bisa 5–10 MB dan langsung menghabiskan kuota
 * localStorage hanya dengan satu kartu. Gambar dipotong ke rasio kartu
 * (63x88 mm) lalu dikompres ke JPEG berukuran cukup untuk cetak.
 */

const TARGET_WIDTH = 560;
const TARGET_HEIGHT = 782; // rasio 63:88, kira-kira 225 dpi saat dicetak
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

  const canvas = document.createElement('canvas');
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl; // fallback: pakai gambar asli

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  // Crop tengah ala object-fit: cover.
  const scale = Math.max(TARGET_WIDTH / img.width, TARGET_HEIGHT / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    img,
    (TARGET_WIDTH - drawWidth) / 2,
    (TARGET_HEIGHT - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Data spell (~1 MB JSON) dipisah dari kode aplikasi supaya bundel
        // aplikasi bisa di-cache ulang tanpa mengunduh datanya lagi.
        manualChunks: {
          spells: ['./src/data/spells-card.json'],
        },
      },
    },
  },
});

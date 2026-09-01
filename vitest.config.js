import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Sebagian besar modul lib/ adalah fungsi murni tanpa DOM; hanya fitCards
    // yang butuh tata letak, dan berkas tesnya meminta jsdom lewat komentar
    // @vitest-environment di baris pertamanya.
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});

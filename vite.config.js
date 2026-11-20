import { defineConfig } from 'vite';

export default defineConfig({
  // base './' เพื่อให้ build แล้วเปิดได้จาก path อื่นๆ (Firebase Hosting / GitHub Pages)
  base: './',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1200,
  },
});

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        impressum: 'impressum.html',
        agb: 'agb.html',
        datenschutz: 'datenschutz.html'
      }
    }
  }
});

import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Todas as páginas do site. Por padrão o Vite só gera o index.html —
// página nova (ex.: um case novo) precisa entrar nesta lista.
const pages = [
  'index.html',
  '404.html',
  'projetos/grade.html',
  'projetos/rubrum.html',
  'projetos/rubrum-site-v1.html',
  'projetos/rubrum-site-v2.html',
  'en/index.html',
  'en/projetos/grade.html',
  'en/projetos/rubrum.html',
  'en/projetos/rubrum-site-v1.html',
  'en/projetos/rubrum-site-v2.html',
];

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(import.meta.dirname, p)])),
    },
  },
});

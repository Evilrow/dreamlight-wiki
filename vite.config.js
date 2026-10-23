import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';

// En dev uniquement : retire la CSP (bloque le préambule React/HMR) et sert data/ddv.json
// pour pouvoir aussi tester dans un navigateur (npm run dev:web).
const devOnly = {
  name: 'ddv-dev',
  apply: 'serve',
  transformIndexHtml: (html) => html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\s*/, ''),
  configureServer(server) {
    server.middlewares.use('/ddv.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(fs.readFileSync('data/ddv.json'));
    });
  },
};

// Au build : copie data/ddv.json dans dist/ pour la version web (GitHub Pages / iPad).
const copyData = {
  name: 'ddv-data',
  apply: 'build',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'ddv.json', source: fs.readFileSync('data/ddv.json') });
  },
};

export default defineConfig({ plugins: [react(), devOnly, copyData], base: './' });

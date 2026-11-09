import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173,
    // allow Cloudflare quick tunnels for playtests
    allowedHosts: ['.trycloudflare.com'],
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ['.trycloudflare.com'],
  },
  build: {
    target: 'es2020',
  },
});

import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import { AstroPWAIntegration } from '@vite-pwa/astro';

// Pro hosting v podsložce (např. GitHub Pages) nastav při buildu BASE_PATH=/nazev-repozitare/
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  output: 'static',
  base,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [
    svelte(),
    AstroPWAIntegration({
      registerType: 'autoUpdate',
      // Service worker registruje src/layouts/Base.astro.
      injectRegister: false,
      // Ikony už pokrývá globPatterns níže. Dvojí záznam s jinou revizí by shodil instalaci service workeru.
      includeManifestIcons: false,
      manifest: {
        name: 'Krizová příručka',
        short_name: 'Příručka',
        description: 'Rodinná offline příručka pro případ krize.',
        lang: 'cs',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      generateSW: {
        // Precache je cache-first: vše se uloží při instalaci a pak se nic nestahuje ze sítě.
        // Neznámá adresa se offline otevře jako úvodní obrazovka (výchozí navigateFallback).
        // Manifest přidává do precache integrace sama.
        globPatterns: ['**/*.{html,js,css,svg,png}'],
      },
    }),
  ],
});

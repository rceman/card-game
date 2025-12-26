import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(() => {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const base = process.env.VITE_BASE ?? (repo ? `/${repo}/` : '/')

  return {
    base,
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used - do not remove them
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: [
          'icons/icon-180.png',
          'icons/icon-192.png',
          'icons/icon-512.png',
          'icons/maskable-192.png',
          'icons/maskable-512.png',
          'icons/favicon-16.png',
          'icons/favicon-32.png',
          'icons/favicon-64.png',
        ],
        manifest: {
          name: 'Brawl Dice',
          short_name: 'Brawl Dice',
          start_url: base,
          scope: base,
          display: 'standalone',
          background_color: '#010217',
          theme_color: '#010217',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icons/maskable-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: 'icons/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          navigateFallback: `${base}index.html`,
        },
      }),
    ],
    resolve: {
      alias: [
        // Alias @ to the src directory
        { find: '@', replacement: path.resolve(__dirname, './src') },
        {
          find: /^figma:asset\//,
          replacement: `${path.resolve(__dirname, './src/assets').replace(/\\/g, '/')}/`,
        },
      ],
    },
  }
})

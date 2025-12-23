import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isGithubPages = mode === 'github'

  return {
    base: isGithubPages ? '/card-game/' : '/',
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used - do not remove them
      react(),
      tailwindcss(),
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

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss({
      content: ['./index.html', './src/**/*.{js,jsx}'],
      safelist: ['dark'] // ensure dark variants are kept
    }),
  ],
})

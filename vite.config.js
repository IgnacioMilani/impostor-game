import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // '/' for Netlify/root deploys; '/impostor-game/' for GitHub Pages project site
  base: process.env.VITE_BASE_PATH || '/',
})

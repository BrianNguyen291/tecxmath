import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages serves from /<repo>/; Vercel and local dev serve from /.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
})

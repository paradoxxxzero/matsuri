// vite.config.js
import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  build: {
    outDir: 'docs',
  },
  plugins: [glsl()],
  server: {
    port: 4747,
  },
})

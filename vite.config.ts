import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { buildContent, sourceFiles } from './scripts/build-question-data.mjs'

function contentPlugin(): Plugin {
  return {
    name: 'markdown-question-bank',
    buildStart() {
      buildContent()
    },
    configureServer(server) {
      server.watcher.add(sourceFiles)
      server.watcher.on('change', (file) => {
        if (
          !sourceFiles.some(
            (source: string) => file.replaceAll('\\', '/') === source.replaceAll('\\', '/'),
          )
        )
          return
        try {
          buildContent()
          server.ws.send({ type: 'full-reload' })
        } catch (error) {
          server.ws.send({ type: 'error', err: { message: String(error), stack: '' } })
        }
      })
    },
  }
}

export default defineConfig({
  base: '/interview-lab/',
  plugins: [contentPlugin(), react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: { target: 'es2022', chunkSizeWarningLimit: 350 },
})

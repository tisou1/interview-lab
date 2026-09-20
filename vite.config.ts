import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { buildContent, sourceFiles } from './scripts/build-question-data.mjs'
import { createProgress } from './scripts/progress.mjs'

function contentPlugin(): Plugin {
  const progress = createProgress()
  let serving = false
  const generate = (label: string) => {
    const questions = buildContent({ onProgress: progress.update })
    progress.done(`${label}：${questions.length} 道题`)
  }
  return {
    name: 'markdown-question-bank',
    configResolved(config) {
      serving = config.command === 'serve'
    },
    buildStart() {
      // `pnpm build` 已由 `pnpm content` 生成数据，这里不再重复输出进度。
      if (!serving) {
        buildContent()
        return
      }
      generate('题库就绪')
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
          generate('题库已更新')
          server.ws.send({ type: 'full-reload' })
        } catch (error) {
          progress.fail(`题库重新生成失败，已保留上次数据：${error}`)
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

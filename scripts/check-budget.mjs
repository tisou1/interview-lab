import fs from 'node:fs'
import { gzipSync } from 'node:zlib'
const assets = fs.readdirSync('dist/assets').filter(name => /\.(js|css)$/.test(name))
let total = 0
for (const name of assets) {
  const size = gzipSync(fs.readFileSync(`dist/assets/${name}`)).length
  total += size
  console.log(`${name}: ${(size / 1024).toFixed(1)} KiB gzip`)
  if (name.startsWith('index-') && name.endsWith('.js') && size > 180 * 1024) throw new Error('入口 JS 超出 180 KiB gzip budget')
}
console.log(`全部 JS/CSS: ${(total / 1024).toFixed(1)} KiB gzip（包含懒加载内容）`)

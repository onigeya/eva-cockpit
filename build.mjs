import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const b64 = (file) => readFileSync(join(root, 'fonts', file)).toString('base64')

const source = readFileSync(join(root, 'client.src.js'), 'utf8')
const output = source
  .replaceAll('__MICHROMA_B64__', b64('Michroma-latin.woff2'))
  .replaceAll('__SHARE_TECH_MONO_B64__', b64('ShareTechMono-latin.woff2'))
  .replaceAll('__NERV_LOGO_B64__', readFileSync(join(root, 'assets', 'nerv-logo.png')).toString('base64'))

writeFileSync(join(root, 'client.js'), output)
console.log(`client.js written (${(output.length / 1024).toFixed(1)} KiB)`)

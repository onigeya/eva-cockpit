import { readFileSync } from 'node:fs'

let captured = null
const effects = []
const slots = []
const fakeDoc = { head: { appendChild() {} }, createElement: () => ({ dataset: {}, textContent: '', remove() {} }) }
const ctx = {
  effect(fn) { const d = fn(); effects.push(d) },
  theme: {
    getTheme: () => ({ preference: 'dark', active: { colorScheme: 'dark', tokens: {} } }),
    setTheme(id) { console.log('setTheme', id) },
    overrideTokens(source, tokens) { captured = { source, tokens }; return () => {} },
  },
  slots: {
    inject(key, cb) { cb() },
    register(options) { slots.push(`${options.name}:${options.id ?? options.priority ?? ''}`); return () => {} },
  },
}
globalThis.window = { addEventListener() {}, removeEventListener() {},
  __ModuleLoader__: {
    load({ factory }) {
      const plugin = factory((id) => {
        if (id !== 'react') throw new Error(`unexpected require ${id}`)
        return {
          createElement: (...args) => ({ args }),
          cloneElement: (element, props) => ({ ...element, props }),
          useState: (value) => [value, () => {}],
          useEffect: () => {},
        }
      })
      console.log('inject:', plugin.inject)
      plugin.apply(ctx)
    },
  },
}
globalThis.document = fakeDoc
globalThis.localStorage = { getItem: () => '1', setItem() {} }
globalThis.matchMedia = () => ({ matches: false })
new Function(readFileSync('./client.js', 'utf8'))()

console.log('slots:', slots.join(', '))
if (captured === null) { console.error('NO TOKENS'); process.exit(1) }
const bad = Object.entries(captured.tokens).filter(([k, v]) => typeof v.light !== 'string' || typeof v.dark !== 'string' || !k.startsWith('--'))
console.log('tokens:', Object.keys(captured.tokens).length, 'bad:', bad.length)
if (bad.length) { console.log(bad.slice(0, 5)); process.exit(1) }

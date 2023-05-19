import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

export function createConfig({ strict = true, dev = true } = {}) {
  return defineConfig({
    envMode: dev ? 'dev' : 'build',
    presets: [
      presetAttributify({ strict }),
      presetUno(),
      presetIcons({
        prefix: 'i-',
        extraProperties: {
          display: 'inline-block'
        }
      })
    ]
  })
}

export default createConfig()

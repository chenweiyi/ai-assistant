import * as antd from 'antd'

// https://github.com/antfu/unplugin-vue-components/blob/main/src/core/resolvers/antdv.ts
// console.log('all', antd)
export const antdPreset = Object.keys(antd).map((i) => {
  if (/^[a-z][A-Za-z]*$/.test(i)) {
    return [i, `_${i}`]
  }
  if (i === 'Image') {
    return [i, 'AImage']
  }
  return [i, i]
})

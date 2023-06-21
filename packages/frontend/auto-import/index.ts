import { antdPreset } from './antd-preset'

export const autoImportPlugin = () =>
  require('unplugin-auto-import/webpack')({
    include: [/\.[tj]sx?$/],
    dts: './src/auto-imports.d.ts',
    imports: [
      'react',
      'ahooks',
      {
        'antd/es': antdPreset
      }
    ],
    eslintrc: {
      enabled: true, // Default `false`
      filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
      globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
    }
  })

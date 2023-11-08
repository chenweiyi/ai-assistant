import { existsSync } from 'node:fs'

import * as dotenv from 'dotenv'
import { defineConfig } from '@umijs/max'
import path from 'path'

import { autoImportPlugin } from './auto-import'

let serverPort = 3000

if (existsSync('../../.env')) {
  const config: any = dotenv.config({
    path: path.resolve('..', '..', '.env')
  })
  // console.log('config:', config)
  serverPort = +config.parsed.SERVER_PORT
}

export default defineConfig({
  hash: true,
  favicons: ['/assets/images/favicon.ico'],
  cssLoaderModules: {
    exportLocalsConvention: 'camelCase'
  },
  plugins: [require.resolve('@umijs/plugins/dist/unocss')],
  unocss: {
    // 检测 className 的文件范围，若项目不包含 src 目录，可使用 `pages/**/*.tsx`
    watch: ['src/**/*.tsx']
  },
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: false,
  mock: false,
  mfsu: false,
  chainWebpack(memo, args) {
    // console.log('memo', memo)
    memo.optimization.minimize(false)
    memo.plugin('unplugin-auto-import').use(autoImportPlugin())
    return memo
  },
  routes: [
    { path: '/', redirect: '/ai/chatgpt' },
    {
      path: '/user',
      component: '@/layouts/index',
      routes: [
        {
          path: '/user/login',
          name: 'userLogin',
          component: '@/pages/login/Login'
        }
      ]
    },
    {
      path: '/ai',
      component: '@/layouts/index',
      routes: [
        {
          path: '/ai/chatgpt',
          name: 'chatgpt',
          component: '@/pages/ai/chatgpt/LayoutIndex'
        }
      ]
    }
  ],
  proxy: {
    '/q': {
      target: `http://localhost:${serverPort}`,
      changeOrigin: true,
      disableHostCheck: true
    }
  },
  npmClient: 'pnpm'
})

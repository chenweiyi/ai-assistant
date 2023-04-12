import { defineConfig } from '@umijs/max'

const serviceUrl = 'http://localhost:3000'

export default defineConfig({
  hash: true,
  favicons: ['/assets/images/favicon.ico'],
  cssLoaderModules: {
    exportLocalsConvention: 'camelCase'
  },
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: false,
  mock: false,
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
    // 指标接口
    '/q': {
      target: serviceUrl,
      changeOrigin: true,
      disableHostCheck: true
    }
  },
  npmClient: 'pnpm'
})

import { Outlet } from '@umijs/max'
import { ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

import './index.less'

dayjs.locale('zh-cn')

const Index = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Outlet />
    </ConfigProvider>
  )
}

export default Index

import { CONVASITION_CHATGPT_KEY } from '@/constants/constant'
import { Modal, Tabs } from 'antd'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import PromptCustom from './PromptCustom'
import PromptWeek from './PromptWeek'

export interface promptModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  choosePrompt: (prompt: string) => void
}

export interface IData {
  value: string
  label: string
  count?: number
}

export default function PromptModal(props: promptModalProps) {
  const ok = () => {
    props.setOpen(false)
  }

  const cancel = () => {
    props.setOpen(false)
  }

  const makeData = () => {
    const sessionData = localStorage.getItem(CONVASITION_CHATGPT_KEY)
    if (sessionData) {
      const data: IConvasition[] = JSON.parse(sessionData) ?? []
      const list: Array<IData> = []
      data.forEach((d) => {
        d.data.forEach((item) => {
          if (item.type === 'question') {
            const findItem = list.find((l) => l.label === item.content)
            if (findItem) {
              findItem.count = findItem.count! + 1
            } else {
              list.push({
                value: item.id,
                label: item.content,
                count: 1
              })
            }
          }
        })
      })
      console.log('list', list)
      const filter = list.sort((a, b) => b.count! - a.count!)
      setData(filter)
    }
  }

  const [data, setData] = useState<Array<IData>>([]) // 历史数据
  const tabItems = [
    {
      key: 'custom',
      label: '历史数据',
      children: <PromptCustom data={data} choosePrompt={props.choosePrompt} />
    },
    {
      key: 'write-week',
      label: '写周报',
      children: <PromptWeek></PromptWeek>
    }
  ]

  useEffect(() => {
    if (props.open) {
      makeData()
    }
  }, [props.open])

  return (
    <Modal
      title='提示词'
      open={props.open}
      onOk={ok}
      onCancel={cancel}
      okText='确定'
      cancelText='取消'
      width={800}
    >
      <div className={clsx('prompt-container', 'p-20px')}>
        <Tabs items={tabItems} />
      </div>
    </Modal>
  )
}

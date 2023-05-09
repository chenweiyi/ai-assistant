import { SESSION_STORAGE_CONVASITION_CHATGPT_KEY } from '@/constants/constant'
import { Modal } from 'antd'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

interface promptModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  choosePrompt: (prompt: string) => void
}

interface IData {
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
    const sessionData = sessionStorage.getItem(
      SESSION_STORAGE_CONVASITION_CHATGPT_KEY
    )
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

  const selectPrompt = (item: IData) => {
    return () => {
      props.choosePrompt(item.label)
    }
  }

  const [data, setData] = useState<Array<IData>>([])

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
      <div
        className={clsx(
          'prompt-container',
          'p-[16px_20px]',
          'max-h-350px',
          'overflow-y-auto',
          'grid',
          'grid-cols-2',
          'gap-1'
        )}
      >
        {data.map((item) => {
          return (
            <div
              className={clsx(
                'prompt-item',
                'my-1',
                'p-2',
                'cursor-pointer',
                'rounded-1',
                'border',
                'border-solid',
                'border-gray-300',
                'hover:border-blue-500',
                'hover:color-blue-500'
              )}
              key={item.value}
              onClick={selectPrompt(item)}
            >
              <div className='prompt-item-label'>{item.label}</div>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

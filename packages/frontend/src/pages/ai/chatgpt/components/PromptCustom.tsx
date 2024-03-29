import { CONVASITION_CHATGPT_KEY } from '@/constants/constant'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

export interface IData {
  value: string
  label: string
  count?: number
}

interface CustomPropmtProps {
  choosePrompt: (prompt: string) => void
}

export default function CustomPropmt(props: CustomPropmtProps) {
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

  const selectPrompt = (item: IData) => {
    return () => {
      props.choosePrompt(item.label)
    }
  }

  useEffect(() => {
    makeData()
  }, [])

  return (
    <div
      className={clsx(
        'prompt-custom-container',
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
  )
}

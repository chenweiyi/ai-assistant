import { getConvasitionData } from '@/utils/store'
import { RefSelectProps, Select } from 'antd'
import { forwardRef, useState } from 'react'

interface SearchInputProps {
  className?: string
  placeholder: string
  maxNumber?: number
  disabled: boolean
  value: string | undefined
  setValue: (value: string) => void
  onValueChange?: (value: string) => void
  onEnterPress?: () => void
}

interface IData {
  value: string
  label: string
  count?: number
}

let cacheList: Array<IData> = []

function SearchInput(props: SearchInputProps, ref: React.Ref<RefSelectProps>) {
  const [data, setData] = useState<{ value: string; label: string }[]>([])

  const [inputValue, setInputValue] = useState<string>('')

  const fetch = (value: string, callback: (arr: Array<IData>) => void) => {
    const sessionData = getConvasitionData() as IConvasition[]
    if (sessionData) {
      const data: IConvasition[] = sessionData
      const list: Array<IData> = []
      cacheList = []
      data.forEach((d) => {
        d.data.forEach((item) => {
          if (item.type === 'question') {
            cacheList.push({
              value: item.id,
              label: item.content
            })
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
      const filter = list
        .filter((l) => l.label.includes(value) || value.includes(l.label))
        .sort((a, b) => b.count! - a.count!)
        .slice(0, props.maxNumber ?? 10)
      callback(filter)
    } else {
      callback([])
    }
  }

  const getLabel = (idOrLabel: string) => {
    return cacheList.find((c) => c.value === idOrLabel)?.label ?? idOrLabel
  }

  const handleSearch = (newValue: string) => {
    console.log('handle search:', newValue)
    setInputValue(newValue)
    fetch(newValue, setData)
  }

  const handleChange = (newValue: string) => {
    console.log('handleChange:', newValue)
    const val = newValue ? getLabel(newValue) : ''
    setInputValue(val)
    props.setValue(val)
  }

  const handlerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('handlerKeyDown', e)
    handleChange(inputValue)
    if (e.key === 'Enter' && inputValue) {
      // props.onEnterPress?.()
    }
  }

  const handlerDropdownVisibleChange = (open: boolean) => {
    if (open) {
      fetch(props.value ?? '', setData)
    }
  }

  const handlerBlur = (value: React.FocusEvent<HTMLElement, Element>) => {
    console.log('handlerBlur', value)
    handleChange(inputValue)
  }

  return (
    <Select
      ref={ref}
      size='large'
      allowClear
      disabled={props.disabled}
      className={props.className}
      showSearch
      value={props.value}
      placeholder={props.placeholder}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onBlur={handlerBlur}
      onSearch={handleSearch}
      onChange={handleChange}
      onDropdownVisibleChange={handlerDropdownVisibleChange}
      onInputKeyDown={handlerKeyDown}
      notFoundContent={null}
      options={data}
    />
  )
}

export default forwardRef(SearchInput)

import {
  CONVASITION_CHATGPT_KEY,
  SETTINGS_CHATGPT_KEY
} from '@/constants/constant'

export type ILocalSettings = {
  apiKey: string
  model: string
  temperature: number
  top_p: number
  enable_markdown?: boolean
}

export function getSettingData(returnType: 'object' | 'string' = 'object') {
  const settings = localStorage.getItem(SETTINGS_CHATGPT_KEY)
  if (settings) {
    return returnType === 'object'
      ? (JSON.parse(settings) as ILocalSettings)
      : settings
  }
  return null
}

export function setSettingData(values: ILocalSettings | string) {
  localStorage.setItem(
    SETTINGS_CHATGPT_KEY,
    typeof values === 'object' ? JSON.stringify(values) : values
  )
}

export function getConvasitionData(returnType: 'array' | 'string' = 'array') {
  const data = localStorage.getItem(CONVASITION_CHATGPT_KEY)
  if (data) {
    return returnType === 'array' ? (JSON.parse(data) as IConvasition[]) : data
  }
  return null
}

export function setConvasitionData(values: IConvasition[] | string) {
  localStorage.setItem(
    CONVASITION_CHATGPT_KEY,
    typeof values === 'object' ? JSON.stringify(values) : values
  )
}

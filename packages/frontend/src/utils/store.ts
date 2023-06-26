import {
  CONVASITION_CHATGPT_KEY,
  SETTINGS_CHATGPT_KEY,
  WEEK_REPORT_CHATGPT_KEY
} from '@/constants/constant'

import { convasitionDB } from './indexdb'

export type ILocalSettings = {
  apiKey: string
  model: string
  temperature: number
  top_p: number
  enable_markdown?: boolean
}

export type IWeekReport = {
  [str: string]: string
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

export async function getConvasitionData(
  returnType: 'array' | 'string' = 'array'
) {
  let data

  if (window.indexedDB) {
    try {
      data = await convasitionDB.getData()
    } catch (e) {
      console.error(e)
    }
  } else {
    data = localStorage.getItem(CONVASITION_CHATGPT_KEY)
  }

  if (data) {
    return returnType === 'array'
      ? typeof data === 'object'
        ? data
        : (JSON.parse(data as string) as IConvasition[])
      : typeof data === 'object'
      ? JSON.stringify(data)
      : data
  }

  return null
}

export async function setConvasitionData(values: IConvasition[] | string) {
  if (window.indexedDB) {
    try {
      const val = typeof values === 'string' ? JSON.parse(values) : values
      await convasitionDB!.setData(val)
    } catch (e) {
      console.error(e)
    }
  } else {
    localStorage.setItem(
      CONVASITION_CHATGPT_KEY,
      typeof values === 'object' ? JSON.stringify(values) : values
    )
  }
}

export function getWeekReportData(returnType: 'object' | 'string' = 'object') {
  const data = localStorage.getItem(WEEK_REPORT_CHATGPT_KEY)
  if (data) {
    return returnType === 'object' ? (JSON.parse(data) as IWeekReport) : data
  }
  return null
}

export function setWeekReportData(values: IWeekReport | string) {
  localStorage.setItem(
    WEEK_REPORT_CHATGPT_KEY,
    typeof values === 'object' ? JSON.stringify(values) : values
  )
}

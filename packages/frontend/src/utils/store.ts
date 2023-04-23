export type ILocalSettings = {
  apiKey: string
  model: string
  temperature: number
  top_p: number
}

export function getSettingData() {
  const settings = localStorage.getItem('settings')
  if (settings) {
    return JSON.parse(settings) as ILocalSettings
  }
  return null
}

export function setSettingData(values: ILocalSettings) {
  localStorage.setItem('settings', JSON.stringify(values))
}

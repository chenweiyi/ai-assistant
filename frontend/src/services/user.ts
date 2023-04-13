import { get } from '@/utils/request'

type requestData =
  | {
      params: {
        key: string
      }
    }
  | undefined

export const User = {
  getUserInfo: async (
    data?: requestData
  ): Promise<Common.Response<UserInfo>> => {
    const res = await get<UserInfo, requestData>('/q/getUserInfo', data)
    console.log('getUserInfo - /q/getUserInfo:', res)
    return res
  }
}

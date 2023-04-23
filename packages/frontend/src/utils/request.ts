import { request } from '@umijs/max'
import { v4 as uuid } from 'uuid'

type IMethod = 'POST' | 'GET'

async function http<ResponseData, RequestData>(
  url: string,
  method: IMethod,
  params?: RequestData,
  config?: any
) {
  const data = await request<Common.Response<ResponseData>>(
    url,
    Object.assign(
      {
        method,
        getResponse: true,
        headers: {
          'X-Trace-Id': uuid()
        }
      },
      method === 'GET' ? { params } : { data: params },
      config
    )
  )

  // console.log('http response data:', data);
  return data?.data ?? {}
}

function get<ResponseData, RequestData = undefined>(
  url: string,
  params?: RequestData,
  config?: any
): Promise<Common.Response<ResponseData>> {
  return http<ResponseData, RequestData>(url, 'GET', params, config)
}

function post<ResponseData, RequestData = undefined>(
  url: string,
  data?: RequestData,
  config?: any
): Promise<Common.Response<ResponseData>> {
  return http<ResponseData, RequestData>(url, 'POST', data, config)
}

export { get, post }

import { extend, RequestOptionsWithResponse } from 'umi-request';
import { v4 as uuid } from 'uuid';

type IMethod = 'POST' | 'GET';

const request = extend({
  charset: 'utf8',
  timeout: 2 * 60 * 1000,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

const CancelToken = request.CancelToken;

async function http<ResponseData, RequestData>(
  url: string,
  method: IMethod,
  params?: RequestData,
  config?: RequestOptionsWithResponse,
) {
  const { token, cancel } = CancelToken.source();
  const data = await request<Common.Response<ResponseData>>(
    url,
    Object.assign(
      {
        method,
        getResponse: true,
        cancelToken: token,
        headers: {
          'X-Trace-Id': uuid(),
        },
      },
      method === 'GET' ? { params } : { data: params },
      config,
    ),
  );

  // console.log('http response data:', data);
  return data?.data ?? {};
}

function get<ResponseData, RequestData = undefined>(
  url: string,
  params?: RequestData,
  config?: RequestOptionsWithResponse,
): Promise<Common.Response<ResponseData>> {
  return http<ResponseData, RequestData>(url, 'GET', params, config);
}

function post<ResponseData, RequestData = undefined>(
  url: string,
  data?: RequestData,
  config?: RequestOptionsWithResponse,
): Promise<Common.Response<ResponseData>> {
  return http<ResponseData, RequestData>(url, 'POST', data, config);
}

export { get, post };

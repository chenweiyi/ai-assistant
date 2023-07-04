import axios from 'axios'
import type { ResponseType } from 'axios'
import debugLibrary from 'debug'
import { EventEmitter } from 'events'
import Koa from 'koa'
import type { CreateChatCompletionRequest } from 'openai'
import { PassThrough } from 'stream'

import { IRes, chatResponse, transformContent } from './message.mjs'

const debug = debugLibrary('completions')
const events = new EventEmitter()
events.setMaxListeners(0)

async function getDataFromResponse(params: CreateChatCompletionRequest) {
  const res: IRes = {
    id: '',
    text: '',
    conversationId: ''
  }

  const requestData = {
    url: process.env.CUSTOM_API_URL,
    method: 'POST',
    headers: {
      cookie: process.env.CUSTOM_COOKIE,
      'content-type': 'application/json',
      proxy: false
    },
    data: {
      prompt: transformContent(params.messages),
      systemMessage: params.messages.find((item) => item.role === 'system')
        ?.content,
      options: {
        operator: 'openai'
      }
    },
    responseType: 'stream' as ResponseType
  }

  let resolve, reject

  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  const response = await axios(requestData)

  debug('requst params', requestData)

  const stream_response = response.data

  stream_response.on('data', (buffer: Buffer) => {
    const responseText = buffer.toString()
    debug('on data...', responseText)

    const lines = responseText.split('\n')

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length <= 0) {
        continue
      }
      // logger.log({responseText: lines[i]});
      const data = JSON.parse(lines[i]) as chatResponse

      if (data.status && data.status === 'Fail') {
        res.text = data.message || ''
      } else {
        if (data.id && data.id.length >= 0) {
          res.id = data.id
        }
        res.text += data.text || ''
      }
    }
  })

  stream_response.on('end', () => {
    debug('on end...')
    resolve({
      id: res.id,
      object: 'chat.completion',
      created: Number(String(new Date().getTime()).slice(0, -3)),
      model: 'gpt-3.5-turbo',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: res.text || ''
          },
          delta: {
            role: 'assistant',
            content: res.text || ''
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 9,
        completion_tokens: 12,
        total_tokens: 21
      }
    })
  })

  stream_response.on('error', (e) => {
    debug('on error...')
    reject({
      id: res.id,
      object: 'chat.completion',
      created: Number(String(new Date().getTime()).slice(0, -3)),
      model: 'gpt-3.5-turbo',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: res.text || ''
          },
          delta: {
            role: 'assistant',
            content: res.text || ''
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 9,
        completion_tokens: 12,
        total_tokens: 21
      }
    })
  })

  return promise
}

export default class Completions {
  /**
   * 模拟 chatgpt 官方 /v1/chat/completions 接口
   * @param ctx
   */
  public static async chat(ctx: Koa.Context) {
    const params = ctx.request.body as CreateChatCompletionRequest
    debug('entrypoint params', ctx.request.body)

    if (params.stream) {
      // 流式响应
      Completions.flowResponse(params, ctx)
    } else {
      // 非流式响应
      await Completions.normalResponse(params, ctx)
    }
  }

  public static async flowResponse(
    params: CreateChatCompletionRequest,
    ctx: Koa.Context
  ) {
    const res: IRes = {
      id: '',
      text: '',
      conversationId: ''
    }

    const stream = new PassThrough()
    const listener = (str) => {
      stream.write(`data: ${str}\n\n`)
    }
    events.on('data', listener)
    stream.on('close', () => {
      debug('trigger on close')
      events.off('data', listener)
    })

    ctx.req.socket.setTimeout(0)
    ctx.req.socket.setNoDelay(true)
    ctx.req.socket.setKeepAlive(true)
    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    })

    ctx.status = 200
    ctx.body = stream

    const requestData = {
      url: process.env.CUSTOM_API_URL,
      method: 'POST',
      headers: {
        cookie: process.env.CUSTOM_COOKIE,
        'content-type': 'application/json',
        proxy: false
      },
      data: {
        prompt: transformContent(params.messages),
        systemMessage: params.messages.find((item) => item.role === 'system')
          ?.content,
        options: {
          operator: 'openai'
        }
      },
      responseType: 'stream' as ResponseType
    }

    const response = await axios(requestData)
    let response_first = true

    debug('requst params', requestData)

    const stream_response = response.data
    stream_response.on('data', (buffer: Buffer) => {
      const responseText = buffer.toString()
      debug('on data...', responseText)

      const lines = responseText.split('\n')

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].length <= 0) {
          continue
        }
        // logger.log({responseText: lines[i]});
        const data = JSON.parse(lines[i]) as chatResponse

        if (data.status && data.status === 'Fail') {
          res.text = data.message || ''
        } else {
          if (data.id && data.id.length >= 0) {
            res.id = data.id
          }
          res.text = data.text || ''
        }

        // params.onProgress(res)
        events.emit(
          'data',
          JSON.stringify({
            id: res.id,
            object: 'chat.completion',
            created: Number(String(new Date().getTime()).slice(0, -3)),
            choices: [
              {
                index: 0,
                message: {
                  role: response_first ? 'assistant' : '',
                  content: res.text || ''
                },
                delta: {
                  role: response_first ? 'assistant' : '',
                  content: res.text || ''
                },
                finish_reason: ''
              }
            ],
            usage: {
              prompt_tokens: 9,
              completion_tokens: 12,
              total_tokens: 21
            }
          })
        )
        response_first = false
      }
    })

    stream_response.on('end', () => {
      debug('on end...')
      events.emit(
        'data',
        JSON.stringify({
          id: res.id,
          object: 'chat.completion',
          created: Number(String(new Date().getTime()).slice(0, -3)),
          choices: [
            {
              index: 0,
              message: {
                role: '',
                content: res.text || ''
              },
              delta: {
                role: '',
                content: res.text || ''
              },
              finish_reason: 'stop'
            }
          ],
          usage: {
            prompt_tokens: 9,
            completion_tokens: 12,
            total_tokens: 21
          }
        })
      )
      stream.end()
    })

    stream_response.on('error', (e) => {
      debug('on error...')
      events.emit(
        'data',
        JSON.stringify({
          id: res.id,
          object: 'chat.completion',
          created: Number(String(new Date().getTime()).slice(0, -3)),
          choices: [
            {
              index: 0,
              message: {
                role: '',
                content: res.text || ''
              },
              delta: {
                role: '',
                content: res.text || ''
              },
              finish_reason: 'stop'
            }
          ],
          usage: {
            prompt_tokens: 9,
            completion_tokens: 12,
            total_tokens: 21
          }
        })
      )
      stream.end()
    })
  }

  public static async normalResponse(
    params: CreateChatCompletionRequest,
    ctx: Koa.Context
  ) {
    const res = await getDataFromResponse(params)
    debug('normal response', res)
    ctx.body = res
  }
}

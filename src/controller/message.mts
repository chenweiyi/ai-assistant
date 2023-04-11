/*
 * @Author: chenweiyi
 * @Date: 2023-02-21 15:54:08
 * @Last Modified by: chenweiyi
 * @Last Modified time: 2023-02-21 15:54:08
 */
import { ChatGPTAPI, ChatMessage } from 'chatgpt'
import { EventEmitter } from 'events'
import proxy from 'https-proxy-agent'
import Koa from 'koa'
import fetch from 'node-fetch'
import { PassThrough } from 'stream'

import { OPENAI_API_KEY } from '../consts/key.mjs'
import { CHATGPT_REQUEST_TIMEOUT } from '../consts/request.mjs'
import { ENABLE_PROXY, PROXY_ADDRESS } from '../consts/server.mjs'

const chatgptApiMap = new Map<string, ChatGPTAPI>()

const events = new EventEmitter()
events.setMaxListeners(0)

export default class MessageController {
  /**
   * 获取chatgpt的消息的sse
   * @param ctx
   */
  public static async sendMsgSSE(ctx: Koa.Context) {
    const { msg, ownerId, parentMessageId } = ctx.request.query as any
    if (!chatgptApiMap.get(ownerId)) {
      const api = new ChatGPTAPI({
        apiKey: OPENAI_API_KEY,
        // @ts-ignore
        fetch: ENABLE_PROXY
          ? (url, options = {}) => {
              const defaultOptions = {
                agent: proxy(PROXY_ADDRESS)
              }
              const mergedOptions = {
                ...defaultOptions,
                ...options
              }
              // @ts-ignore
              return fetch(url, mergedOptions)
            }
          : undefined
      })
      chatgptApiMap.set(ownerId, api)
    }
    const api = chatgptApiMap.get(ownerId)
    const stream = new PassThrough()
    const listener = (str) => {
      stream.write(`data: ${str}\n\n`)
    }
    events.on('data', listener)
    stream.on('close', () => {
      console.log('trigger on close')
      events.off('data', listener)
    })
    try {
      console.log(' execute sendMsgSSE ...')
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

      api
        .sendMessage(msg, {
          onProgress: (partialResponse: ChatMessage) => {
            const data = JSON.stringify({
              text: partialResponse.text,
              id: partialResponse.id,
              done: false,
              error: false
            })
            events.emit('data', data)
          },
          timeoutMs: CHATGPT_REQUEST_TIMEOUT,
          ...(parentMessageId
            ? {
                parentMessageId
              }
            : {})
        })
        .then((res) => {
          events.emit(
            'data',
            JSON.stringify({
              text: res.text,
              id: res.id,
              done: true,
              error: false
            })
          )
          stream.end()
        })
        .catch((e) => {
          console.log('== error, error type:', typeof e, e.message)
          events.emit(
            'data',
            JSON.stringify({
              text: e.message,
              id: 'error-' + new Date().getTime() + '',
              done: true,
              error: true
            })
          )
          stream.end()
        })
    } catch (e: any) {
      console.log('Error:', e)
      ctx.body = stream
      events.emit(
        'data',
        JSON.stringify({
          text: e.message ?? 'server inner error',
          id: 'error-' + new Date().getTime() + '',
          done: true,
          error: true
        })
      )
      stream.end()
    }
  }
}

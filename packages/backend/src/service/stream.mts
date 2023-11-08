import { ChatMessage, CreateChatCompletionStreamResponse } from 'chatgpt'
import debugLibrary from 'debug'
import { EventEmitter } from 'events'
import { Context } from 'koa'
import { CreateChatCompletionRequest } from 'openai'
import { PassThrough } from 'stream'

import { ISSEQuery } from '../controller/message.mjs'
import { MAX, logText, sendChatGptData } from '../utils/util.mjs'
import { responseChatgpt } from './thirdparty.mjs'

const debug = debugLibrary('service:stream')

export async function flowResponse(
  query: ISSEQuery,
  ctx: Context,
  events: EventEmitter
) {
  const stream = new PassThrough()
  const listener = (str) => {
    stream.write(`data: ${str}\n\n`)
  }

  events.on('data', listener)
  stream.on('close', () => {
    debug('request done!')
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

  responseChatgpt(query, {
    onData: (data: ChatMessage) => {
      debug(
        `...in writing, Display up to ${MAX} characters: %s`,
        logText(data.text ?? '')
      )
      const res = JSON.stringify({
        text: data.text,
        id: data.id,
        conversationId: data.conversationId,
        done: false,
        error: false
      })
      events.emit('data', res)
    },
    onEnd: (data: ChatMessage) => {
      debug(
        '...write flush over, Display up to ${MAX} characters: %s',
        data.text ?? ''
      )
      const res = JSON.stringify({
        text: data.text,
        id: data.id,
        conversationId: data.conversationId,
        done: true,
        error: false
      })
      events.emit('data', res)
      stream.end()
    },
    onError: (e) => {
      debug('request error', e.message)
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
    }
  })
}

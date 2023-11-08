import debugLibrary from 'debug'
import { EventEmitter } from 'events'
import Koa from 'koa'

import { flowResponse } from '../service/stream.mjs'

const debug = debugLibrary('controller:completions')
const events = new EventEmitter()
events.setMaxListeners(0)

export interface ISSEQuery {
  msg: string
  ownerId?: string
  parentMessageId?: string
  conversationId?: string
  model?: string
  apiKey?: string
  temperature?: string
  top_p?: string
}

export default class MessageController {
  /**
   * 获取chatgpt的消息的sse
   * @param ctx
   */
  public static async sendMsgSSE(ctx: Koa.Context) {
    const query = ctx.request.query as unknown as ISSEQuery
    debug('sendMsgSSE params', JSON.stringify(ctx.request.query))

    flowResponse(query, ctx, events)
  }
}

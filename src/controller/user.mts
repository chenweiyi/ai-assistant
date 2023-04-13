/*
 * @Author: chenweiyi
 * @Date: 2023-02-21 15:54:08
 * @Last Modified by: chenweiyi
 * @Last Modified time: 2023-02-21 15:54:08
 */
import dayjs from 'dayjs'
import debugLibrary from 'debug'
import proxy from 'https-proxy-agent'
import Koa from 'koa'
import fetch from 'node-fetch'

import { PROXY_ADDRESS } from '../consts/server.mjs'

const debug = debugLibrary('user')

export default class UserController {
  /**
   * 获取用户信息
   * @param ctx
   */
  public static async getUserInfo(ctx: Koa.Context) {
    const {
      authorization = 'Bearer sess-2FjoGNaBugiiXxQck5sOKAgWF1NbTGgUJP4v6pFe',
      openaiOrganization = 'org-z6Krzviaova5UosyD2hW1dI0',
      origin = 'https://platform.openai.com',
      referer = 'https://platform.openai.com/'
    } = ctx.request.query as any
    debug('/q/getUserInfo params: ', JSON.stringify(ctx.request.query))

    const res = await fetch(
      `https://api.openai.com/dashboard/billing/credit_grants`,
      {
        headers: {
          authorization,
          'openai-organization': openaiOrganization,
          origin,
          referer
        },
        agent: proxy(PROXY_ADDRESS)
      }
    )
    const data: any = await res.json()
    debug('/q/getUserInfo result: ', data)
    ctx.body = {
      code: 200,
      msg: 'ok',
      data: {
        total: data.total_granted,
        used: data.total_used,
        available: data.total_available,
        grants: data.grants
      },
      success: true
    }
  }
}

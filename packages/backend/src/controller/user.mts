/*
 * @Author: chenweiyi
 * @Date: 2023-02-21 15:54:08
 * @Last Modified by: chenweiyi
 * @Last Modified time: 2023-02-21 15:54:08
 */
import debugLibrary from 'debug'
import proxy from 'https-proxy-agent'
import Koa from 'koa'
import fetch from 'node-fetch'

// import { ACCOUNT_AUTHORIZATION, ACCOUNT_ORGANIZATION } from '../consts/key.mjs'

const debug = debugLibrary('user')

export default class UserController {
  /**
   * 获取用户信息
   * @param ctx
   */
  public static async getUserInfo(ctx: Koa.Context) {
    const {
      authorization,
      openaiOrganization,
      origin = 'https://platform.openai.com',
      referer = 'https://platform.openai.com/'
    } = ctx.request.query as any
    debug('/q/getUserInfo params: ', JSON.stringify(ctx.request.query))

    try {
      const res = await fetch(
        `https://api.openai.com/dashboard/billing/credit_grants`,
        {
          headers: {
            authorization,
            'openai-organization': openaiOrganization,
            origin,
            referer
          },
          agent: proxy(process.env.PROXY_ADDRESS)
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
    } catch (e) {
      debug('/q/getUserInfo error: ', e)
      ctx.body = {
        code: 500,
        msg: e.message,
        data: undefined,
        success: false
      }
    }
  }
}

/*
 * @Author: chenweiyi
 * @Date: 2023-02-21 15:54:08
 * @Last Modified by: chenweiyi
 * @Last Modified time: 2023-02-21 15:54:08
 */

import Koa from "koa";
import { ChatGPTAPI } from "chatgpt";
import { OPENAI_API_KEY } from "../consts/key.mjs";
import { CHATGPT_REQUEST_TIMEOUT } from "../consts/request.mjs";
import { pushMessage, getClientIp } from "../utils/util.mjs";
import proxy from "https-proxy-agent";
import fetch, { RequestInfo, RequestInit } from "node-fetch";

const chatgptApiMap = new Map();

export default class MessageController {
  /**
   * 向chatgpt发送消息
   * @param ctx
   * @param next
   */
  public static async sendMsg(ctx: Koa.Context) {
    const { msg, ownerId, parentMessageId, conversationId } = ctx.request
      .body as any;
    if (!chatgptApiMap.get(ownerId)) {
      const api = new ChatGPTAPI({
        apiKey: OPENAI_API_KEY,
        // @ts-ignore
        fetch: (url, options = {}) => {
          const defaultOptions = {
            agent: proxy("http://127.0.0.1:33210"),
          };
          const mergedOptions = {
            ...defaultOptions,
            ...options,
          };
          // @ts-ignore
          return fetch(url, mergedOptions);
        },
        // markdown: false,
      });
      chatgptApiMap.set(ownerId, api);
    }
    const api = chatgptApiMap.get(ownerId);
    try {
      let res = await api.sendMessage(msg, {
        // onProgress: (partialResponse) => {
        //   console.log('partial text:', partialResponse.text)
        // },
        timeoutMs: CHATGPT_REQUEST_TIMEOUT,
        ...(parentMessageId
          ? {
              conversationId,
              parentMessageId,
            }
          : {}),
      });
      // 推送消息
      // pushMessage({
      //   title: '[Success] Send message to ChatGPT',
      //   desp: `
      //     1. 问题: ${msg}
      //     2. 答案: ${res.text.substring(0, 10) + '...'}
      //     3. 客户端ip: ${getClientIp(ctx.req)}
      //   `
      // })

      // console.log('== res:', res)
      ctx.body = {
        code: 200,
        msg: "ok",
        data: res,
        success: true,
      };
    } catch (e: any) {
      console.log("Error:", e);
      // 推送消息
      // pushMessage({
      //   title: '[Error] Send message to ChatGPT',
      //   desp: e.message ?? '未知错误'
      // })
      ctx.body = {
        code: 500,
        msg: e.message,
        data: e,
        success: false,
      };
    }
  }
}

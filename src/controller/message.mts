/*
 * @Author: chenweiyi
 * @Date: 2023-02-21 15:54:08
 * @Last Modified by: chenweiyi
 * @Last Modified time: 2023-02-21 15:54:08
 */

import Koa from "koa";
import { ChatGPTAPI } from "chatgpt";
import { OPENAI_API_KEY } from "../consts/key.mjs";
import { CHATGPT_REQUEST_TIMEOUT, ENABLE_REQUEST_STREAM } from "../consts/request.mjs";
// import { pushMessage, getClientIp } from "../utils/util.mjs";
import proxy from "https-proxy-agent";
import fetch, { RequestInfo, RequestInit } from "node-fetch";
import { PROXY_ADDRESS, ENABLE_PROXY } from "../consts/server.mjs";

const chatgptApiMap = new Map();

export default class MessageController {
  /**
   * 向chatgpt发送消息
   * @param ctx
   * @param next
   */
  public static async sendMsg(ctx: Koa.Context) {
    const { msg, ownerId, parentMessageId } = ctx.request
      .body as any;
    if (!chatgptApiMap.get(ownerId)) {
      const api = new ChatGPTAPI({
        apiKey: OPENAI_API_KEY,
        // @ts-ignore
        fetch: ENABLE_PROXY ? (url, options = {}) => {
          const defaultOptions = {
            agent: proxy(PROXY_ADDRESS),
          };
          const mergedOptions = {
            ...defaultOptions,
            ...options,
          };
          // @ts-ignore
          return fetch(url, mergedOptions);
        } : undefined,
      });
      chatgptApiMap.set(ownerId, api);
    }
    const api = chatgptApiMap.get(ownerId);
    try {
      if (ENABLE_REQUEST_STREAM) {
        let res = await api.sendMessage(msg, {
          onProgress: (partialResponse) => {
            ctx.body = {
              code: 200,
              msg: "ok",
              data: partialResponse.text,
              success: true,
            };
          },
          timeoutMs: CHATGPT_REQUEST_TIMEOUT,
          ...(parentMessageId
            ? {
                parentMessageId,
              }
            : {}),
        });
        ctx.body = {
          code: 200,
          msg: "ok",
          data: res,
          success: true,
        };
      } else {
        let res = await api.sendMessage(msg, {
          timeoutMs: CHATGPT_REQUEST_TIMEOUT,
          ...(parentMessageId
            ? {
                parentMessageId,
              }
            : {}),
        });
  
        // console.log('== res:', res)
        ctx.body = {
          code: 200,
          msg: "ok",
          data: res,
          success: true,
        };
      }
    } catch (e: any) {
      console.log("Error:", e);
      ctx.body = {
        code: 500,
        msg: e.message,
        data: e,
        success: false,
      };
    }
  }
}

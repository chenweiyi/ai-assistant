/*
 * @Author: chenweiyi
 * @Date: 2023-02-21 15:54:08
 * @Last Modified by: chenweiyi
 * @Last Modified time: 2023-02-21 15:54:08
 */

import Koa from "koa";
import { ChatGPTAPI } from "chatgpt";
import { OPENAI_API_KEY } from "../consts/key.mjs";
import {
  CHATGPT_REQUEST_TIMEOUT,
  ENABLE_REQUEST_STREAM,
} from "../consts/request.mjs";
// import { pushMessage, getClientIp } from "../utils/util.mjs";
import proxy from "https-proxy-agent";
import fetch, { RequestInfo, RequestInit } from "node-fetch";
import { PROXY_ADDRESS, ENABLE_PROXY } from "../consts/server.mjs";
import { PassThrough } from "stream";
import { EventEmitter } from "events";

const chatgptApiMap = new Map<string, ChatGPTAPI>();

const events = new EventEmitter();
events.setMaxListeners(0);

export default class MessageController {
  /**
   * 获取chatgpt消息
   * @param ctx
   * @param next
   */
  public static async sendMsg(ctx: Koa.Context) {
    const { msg, ownerId, parentMessageId } = ctx.request.body as any;
    if (!chatgptApiMap.get(ownerId)) {
      const api = new ChatGPTAPI({
        apiKey: OPENAI_API_KEY,
        // @ts-ignore
        fetch: ENABLE_PROXY
          ? (url, options = {}) => {
              const defaultOptions = {
                agent: proxy(PROXY_ADDRESS),
              };
              const mergedOptions = {
                ...defaultOptions,
                ...options,
              };
              // @ts-ignore
              return fetch(url, mergedOptions);
            }
          : undefined,
      });
      chatgptApiMap.set(ownerId, api);
    }
    const api = chatgptApiMap.get(ownerId);
    try {
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

  /**
   * 获取chatgpt的消息的sse
   * @param ctx
   */
  public static async sendMsgSSE(ctx: Koa.Context) {
    const { msg, ownerId, parentMessageId } = ctx.request.query as any;
    // if (!chatgptApiMap.get(ownerId)) {
    //   const api = new ChatGPTAPI({
    //     apiKey: OPENAI_API_KEY,
    //     // @ts-ignore
    //     fetch: ENABLE_PROXY ? (url, options = {}) => {
    //         const defaultOptions = {
    //           agent: proxy(PROXY_ADDRESS),
    //         };
    //         const mergedOptions = {
    //           ...defaultOptions,
    //           ...options,
    //         };
    //         // @ts-ignore
    //         return fetch(url, mergedOptions);
    //       } : undefined,
    //   });
    //   chatgptApiMap.set(ownerId, api);
    // }
    // const api = chatgptApiMap.get(ownerId);
    try {
      console.log(" execute sendMsgSSE ...");
      ctx.req.socket.setTimeout(0);
      ctx.req.socket.setNoDelay(true);
      ctx.req.socket.setKeepAlive(true);
      ctx.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      });
      const stream = new PassThrough();
      ctx.status = 200;
      ctx.body = stream;

      let timer;

      const listener = (data) => {
        stream.write(`data: ${data}\n\n`);

        // 如果触发数据长度大于10，则不再发送数据
        if (JSON.parse(data).id > 10) {
          stream.end();
        }
      };

      events.on("data", listener);

      // const res = await api.sendMessage(msg, {
      //   onProgress: (partialResponse) => {
      //     console.log("== onProgress response:", partialResponse.text.length > 50 ? partialResponse.text.slice(0, 50) + '...' : partialResponse.text);
      //     events.emit('data', partialResponse.text);
      //   },
      //   timeoutMs: CHATGPT_REQUEST_TIMEOUT,
      //   ...(parentMessageId
      //     ? {
      //         parentMessageId,
      //       }
      //     : {}),
      // });

      let i = 0;
      let initData = i + "";

      timer = setInterval(() => {
        initData = i === 0 ? "0" : initData + i;
        console.log("== emit data:", JSON.stringify({ data: initData, id: i }));
        events.emit("data", JSON.stringify({ data: initData, id: i }));
        i++;
      }, 1000);

      // events.emit('data', res.text);

      stream.on("close", () => {
        console.log("trigger on close");
        clearInterval(timer);
        events.off("data", listener);
      });
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

import { ChatGPTAPI, ChatGPTUnofficialProxyAPI, ChatMessage } from 'chatgpt'
import debugLibrary from 'debug'
import proxy from 'https-proxy-agent'
import { isNil } from 'lodash-es'

import { ISSEQuery } from '../controller/message.mjs'

const debug = debugLibrary('service:thirdparty')
const chatgptApiMap = new Map<string, ChatGPTAPI | ChatGPTUnofficialProxyAPI>()

const getRestOptions = ({ parentMessageId }: { parentMessageId: string }) => {
  return {
    parentMessageId
  }
}

export async function responseChatgpt(
  query: ISSEQuery,
  callbacks: IResponseChatGptCallbacks = {}
) {
  const {
    msg,
    ownerId,
    parentMessageId,
    conversationId,
    model,
    apiKey,
    temperature,
    top_p
  } = query
  if (!chatgptApiMap.get(ownerId)) {
    const api = new ChatGPTAPI({
      apiBaseUrl: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com',
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      completionParams: {
        model: model || 'gpt-3.5-turbo',
        temperature: isNil(temperature) ? 0.8 : +temperature,
        top_p: isNil(top_p) ? 1 : +top_p
      },
      // @ts-ignore
      fetch: process.env.CUSTOM_PROXY
        ? (url, options = {}) => {
            const defaultOptions = {
              agent: proxy(process.env.CUSTOM_PROXY)
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
  try {
    debug('...input messages: %o', msg)
    // @ts-ignore
    const result = await api.sendMessage(msg, {
      onProgress: (partialResponse: ChatMessage) => {
        callbacks.onData?.(partialResponse)
      },
      timeoutMs: +process.env.CHATGPT_REQUEST_TIMEOUT,
      ...getRestOptions({
        parentMessageId
      })
    })
    callbacks.onEnd?.(result)
  } catch (e) {
    callbacks.onError?.(e)
  }
}

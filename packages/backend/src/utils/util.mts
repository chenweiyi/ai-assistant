import http from 'http'

export type Role = 'user' | 'assistant' | 'system'

export type ICreateChatCompletionDeltaResponse = {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: [
    {
      delta: {
        role?: Role
        content?: string
      }
      index: number
      finish_reason: string | null
    }
  ]
}

export type ICreateChatCompletionResponse = {
  /**
   *
   * @type {string}
   * @memberof CreateChatCompletionResponse
   */
  id: string
  /**
   *
   * @type {string}
   * @memberof CreateChatCompletionResponse
   */
  object: string
  /**
   *
   * @type {number}
   * @memberof CreateChatCompletionResponse
   */
  created: number
  /**
   *
   * @type {string}
   * @memberof CreateChatCompletionResponse
   */
  model: string
  /**
   *
   * @type {Array<CreateChatCompletionResponseChoicesInner>}
   * @memberof CreateChatCompletionResponse
   */
  choices: Array<CreateChatCompletionResponseChoicesInner>
  /**
   *
   * @type {CreateCompletionResponseUsage}
   * @memberof CreateChatCompletionResponse
   */
  usage?: CreateCompletionResponseUsage
}

export interface CreateChatCompletionResponseChoicesInner {
  /**
   *
   * @type {number}
   * @memberof CreateChatCompletionResponseChoicesInner
   */
  index?: number
  /**
   *
   * @type {ChatCompletionResponseMessage}
   * @memberof CreateChatCompletionResponseChoicesInner
   */
  message?: ChatCompletionResponseMessage
  /**
   *
   * @type {string}
   * @memberof CreateChatCompletionResponseChoicesInner
   */
  finish_reason?: string
}

export interface CreateCompletionResponseUsage {
  /**
   *
   * @type {number}
   * @memberof CreateCompletionResponseUsage
   */
  prompt_tokens: number
  /**
   *
   * @type {number}
   * @memberof CreateCompletionResponseUsage
   */
  completion_tokens: number
  /**
   *
   * @type {number}
   * @memberof CreateCompletionResponseUsage
   */
  total_tokens: number
}

export interface ChatCompletionResponseMessage {
  /**
   * The role of the author of this message.
   * @type {string}
   * @memberof ChatCompletionResponseMessage
   */
  role: Role
  /**
   * The contents of the message
   * @type {string}
   * @memberof ChatCompletionResponseMessage
   */
  content: string
}

// 最多渲染字符个数
export const MAX = 100

export const getClientIp = function (req: http.IncomingMessage) {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
  ip = Array.isArray(ip) ? ip[0] : ip
  if (ip.indexOf('::ffff:') !== -1) {
    ip = ip.substring(7)
  }

  return ip
}

export const logText = (text: string) => {
  if (text.length > MAX) {
    return text.slice(0, MAX) + '...'
  }
  return text
}

export function sendChatGptData({
  res,
  finish_reason,
  msg,
  tojson
}: ISendChatGptDataProps) {
  const getChoices = () => {
    if (res.stream) {
      let response_first = res.response_first
      res.response_first = false
      return [
        {
          index: 0,
          delta: {
            role: response_first ? 'assistant' : undefined,
            content: msg || res.text || ''
          },
          finish_reason
        }
      ]
    } else {
      return [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: msg || res.text || ''
          },
          finish_reason
        }
      ]
    }
  }

  const result = {
    id: res.id,
    object: res.stream ? 'chat.completion.chunk' : 'chat.completion',
    created: Number(String(new Date().getTime()).slice(0, -3)),
    choices: getChoices(),
    model: 'gpt-3.5-turbo',
    usage: {
      prompt_tokens: 9,
      completion_tokens: 12,
      total_tokens: 21
    }
  } as ICreateChatCompletionResponse | ICreateChatCompletionDeltaResponse

  return tojson ? result : JSON.stringify(result)
}

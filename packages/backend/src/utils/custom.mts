import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { ChatGPTAPIOptions, SendMessageOptions } from 'chatgpt'
import debugLibrary from 'debug'

import { CustomChatMessage } from '../controller/message.mjs'

const debug = debugLibrary('custom')

const SystemMessage =
  'You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: 2023-06-12'

interface ICustomRequestProps extends ChatGPTAPIOptions {
  url: string
  cookie: string
}

type chatResponse = {
  id: string
  text: string
} & {
  data?: null
  message?: string
  status?: string
}

export default function CustomChatGPTAPI(props: ICustomRequestProps) {
  const { cookie } = props
  debug('into CustomChatGPTAPI...')
  const instance = axios.create({
    timeout: 30000,
    headers: {
      proxy: false,
      cookie,
      'content-type': 'application/json'
      // Origin: host,
      // Referer: host
    }
  })

  this.instance = instance
  this.props = props
}

CustomChatGPTAPI.prototype.sendMessage = async function (
  msg: string,
  params: SendMessageOptions & {
    onProgress: (res: CustomChatMessage) => void
  }
) {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  const res = {
    id: '',
    text: '',
    conversationId: ''
  }
  const response = await (this.instance as AxiosInstance).post(
    this.props.url,
    {
      prompt: msg,
      systemMessage: SystemMessage,
      options: {
        operator: 'openai',
        parentMessageId: params.parentMessageId
      }
    },
    {
      responseType: 'stream'
    }
  )

  const stream = response.data
  stream.on('data', (buffer: Buffer) => {
    debug('on data...')
    const responseText = buffer.toString()

    const lines = responseText.split('\n')

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length <= 0) {
        continue
      }
      // logger.log({responseText: lines[i]});
      const data = JSON.parse(lines[i]) as chatResponse

      if (data.status && data.status === 'Fail') {
        res.text = data.message || ''
      } else {
        if (data.id && data.id.length >= 0) {
          res.id = data.id
        }
        res.text += data.text || ''
      }

      params.onProgress(res)
    }
  })

  stream.on('end', () => {
    debug('on end...')
    resolve(res)
  })

  stream.on('error', (e) => {
    debug('on error...')
    reject(e)
  })

  return promise
}

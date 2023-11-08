interface IRes {
  id: string
  text: string
  conversationId: string
  response_first: boolean
  stream: boolean
}

type chatResponse = {
  id: string
  text: string
} & {
  data?: null
  message?: string
  status?: string
}

type IResponseGptCallbacks = {
  onData?: (data: any) => void
  onEnd?: () => void
  onError?: (e: any) => void
}

type IResponseChatGptCallbacks = {
  onData?: (data: ChatMessage) => void
  onEnd?: (data: ChatMessage) => void
  onError?: (e: any) => void
}

type ISendChatGptDataProps = {
  res: IRes
  finish_reason: string | null
  msg?: string
  tojson?: boolean
}

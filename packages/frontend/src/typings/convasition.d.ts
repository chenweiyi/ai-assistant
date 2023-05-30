interface IConvasition {
  sessionId: string
  active: boolean
  title: string
  order: number
  data: Answer.answer[]
  parentMessageId: string
  conversationId?: string
  isLoading: boolean
  isInput: boolean
}

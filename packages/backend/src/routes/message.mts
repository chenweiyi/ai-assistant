import MessageController from '../controller/message.mjs'
import { router, routerChatgpt } from './index.mjs'

router.all('/sendMsg/sse', MessageController.sendMsgSSE)

routerChatgpt.post('/v1/chat/completions', MessageController.completions)

export { router, routerChatgpt }

import MessageController from '../controller/message.mjs'
import { router } from './index.mjs'

router.all('/sendMsg/sse', MessageController.sendMsgSSE)

export { router }

import MessageController from '../controller/message.mjs'
import router from './index.mjs'

router.all('/sendMsg/sse', MessageController.sendMsgSSE)

router.post('/v1/completions', MessageController.completions)

export default router

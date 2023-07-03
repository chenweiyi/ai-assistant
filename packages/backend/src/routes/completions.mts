import Completions from '../controller/completions.mjs'
import { routerChatgpt } from './index.mjs'

routerChatgpt.post('/chat/completions', Completions.chat)

export { routerChatgpt }

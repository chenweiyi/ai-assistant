import RouterEngine from '@koa/router'

const router = new RouterEngine()
const routerChatgpt = new RouterEngine()

router.prefix('/q')

routerChatgpt.prefix('/v1')

export { router, routerChatgpt }

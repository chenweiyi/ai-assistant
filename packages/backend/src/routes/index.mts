import RouterEngine from '@koa/router'

const router = new RouterEngine()

router.prefix('/q')

export { router }

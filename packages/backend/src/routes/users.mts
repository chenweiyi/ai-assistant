import UserController from '../controller/user.mjs'
import router from './index.mjs'

router.get('/getUserInfo', UserController.getUserInfo)

export default router

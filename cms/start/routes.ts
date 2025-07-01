import router from '@adonisjs/core/services/router'
import UserController from '#controllers/user_controller'
import { middleware } from '#start/kernel'

router.post('/signup', [UserController, 'signup'])
router.post('/login', [UserController, 'login'])
router.get('/details', (ctx) => new UserController().userDetails(ctx)).use(middleware.auth())

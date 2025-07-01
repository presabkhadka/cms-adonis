/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import UserController from '#controllers/user_controller'

router.post('/signup', [UserController, 'signup'])
router.post('/login', [UserController, 'login'])

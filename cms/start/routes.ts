import router from '@adonisjs/core/services/router'
import UserController from '#controllers/user_controller'
import { middleware } from '#start/kernel'
import AdminController from '#controllers/admin_controller'
import TagsController from '#controllers/tags_controller'
import ContentsController from '#controllers/contents_controller'

router.post('/api/signup', (ctx) => new UserController().signup(ctx))
router.post('/api/login', [UserController, 'login'])
router.get('/api/details', (ctx) => new UserController().userDetails(ctx)).use(middleware.auth())
router
  .patch('/api/update-details/:userId', (ctx) => new UserController().editUserDetails(ctx))
  .use(middleware.auth())
router
  .delete('/api/delete-user/:userId', (ctx) => new UserController().deleteUserDetails(ctx))
  .use(middleware.auth())
router.post('/api/admin/login', (ctx) => new AdminController().adminLogin(ctx))
router
  .get('/api/admin/users', (ctx) => new AdminController().viewAllUser(ctx))
  .use(middleware.auth())
router.post('/api/add-tag', (ctx) => new TagsController().createTag(ctx)).use(middleware.auth())
router.get('/api/tags', (ctx) => new TagsController().fetchTag(ctx))
router
  .delete('/api/delete-tag/:tagId', (ctx) => new TagsController().deleteTag(ctx))
  .use(middleware.auth())
router
  .patch('/api/update-tag/:tagId', (ctx) => new TagsController().updateTag(ctx))
  .use(middleware.auth())
router
  .post('/api/content/create', (ctx) => new ContentsController().createContent(ctx))
  .use(middleware.auth())
router.get('/api/content/fetch', (ctx) => new ContentsController().fetchContent(ctx))
router
  .patch('/api/content/update/:contentId', (ctx) => new ContentsController().editContent(ctx))
  .use(middleware.auth())
router
  .delete('/api/content/delete/:contentId', (ctx) => new ContentsController().deleteContent(ctx))
  .use(middleware.auth())

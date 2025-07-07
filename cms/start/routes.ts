import router from '@adonisjs/core/services/router'
import UserController from '#controllers/user_controller'
import { middleware } from '#start/kernel'
import AdminController from '#controllers/admin_controller'
import TagsController from '#controllers/tags_controller'
import ContentsController from '#controllers/contents_controller'
import CommentsController from '#controllers/comments_controller'
import CategoriesController from '#controllers/categories_controller'
import RevisionsController from '#controllers/revisions_controller'
import SettingsController from '#controllers/settings_controller'

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
router
  .post('/api/comment/create/:contentId', (ctx) => new CommentsController().addComment(ctx))
  .use(middleware.auth())
router.get('/api/comment/fetch/:contentId', (ctx) => new CommentsController().fetchComment(ctx))
router
  .patch('/api/comment/update/:commentId', (ctx) => new CommentsController().editComment(ctx))
  .use(middleware.auth())
router
  .delete('/api/comment/delete/:commentId', (ctx) => new CommentsController().deleteComment(ctx))
  .use(middleware.auth())
router
  .post('/api/category/create', (ctx) => new CategoriesController().createCategory(ctx))
  .use(middleware.auth())
router.get('/api/category/fetch', (ctx) => new CategoriesController().fetchCategory(ctx))
router
  .patch('/api/category/update/:categoryId', (ctx) => new CategoriesController().editCategory(ctx))
  .use(middleware.auth())
router
  .delete('/api/category/delete/:categoryId', (ctx) =>
    new CategoriesController().deleteCateogry(ctx)
  )
  .use(middleware.auth())
router.get('/api/revision/all/:contentId', (ctx) => new RevisionsController().fetchRevision(ctx))
router.get('/api/revision/:revisionId', (ctx) => new RevisionsController().fetchSingleRevision(ctx))
router.get('/api/settings', (ctx) => new SettingsController().fetchSetting(ctx))
router
  .post('/api/settings/create', (ctx) => new SettingsController().createSetting(ctx))
  .use(middleware.auth())
router
  .patch('/api/settings/update/:settingsId', (ctx) => new SettingsController().editSettings(ctx))
  .use(middleware.auth())
router
  .delete('/api/settings/delete/:settingsId', (ctx) => new SettingsController().deleteSettings(ctx))
  .use(middleware.auth())
router
  .get('/api/admin/contents', (ctx) => new AdminController().viewAllContents(ctx))
  .use(middleware.auth())
router
  .get('/api/admin/total-content', (ctx) => new AdminController().totalContents(ctx))
  .use(middleware.auth())
router
  .get('/api/admin/total-users', (ctx) => new AdminController().totalUsers(ctx))
  .use(middleware.auth())
router
  .get('/api/admin/total-categories', (ctx) => new AdminController().totalCategories(ctx))
  .use(middleware.auth())
router
  .patch('/api/admin/content/publish/:contentId', (ctx) =>
    new AdminController().publishContent(ctx)
  )
  .use(middleware.auth())
router
  .patch('/api/admin/content/draft/:contentId', (ctx) => new AdminController().draftContent(ctx))
  .use(middleware.auth())
router
  .delete('/api/admin/content/delete/:contentId', (ctx) => new AdminController().deleteContent(ctx))
  .use(middleware.auth())
router
  .get('/api/admin/comments', (ctx) => new AdminController().loadComment(ctx))
  .use(middleware.auth())
router
  .patch('/api/admin/comment/approve/:commentId', (ctx) =>
    new AdminController().approveComment(ctx)
  )
  .use(middleware.auth())
router
  .patch('/api/admin/comment/reject/:commentId', (ctx) => new AdminController().rejectComment(ctx))
  .use(middleware.auth())
router
  .delete('/api/admin/comment/delete/:commentId', (ctx) =>
    new AdminController().deleteCommentAdmin(ctx)
  )
  .use(middleware.auth())

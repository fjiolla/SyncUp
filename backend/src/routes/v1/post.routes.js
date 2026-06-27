import { Router } from 'express';
import * as postController from '../../controllers/post.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect } from '../../middlewares/auth.js';
import {
  createPostSchema,
  updatePostSchema,
  commentSchema,
  paginationSchema,
} from '../../validators/post.validator.js';

const router = Router();

router.post('/pods/:podId/posts', protect, validate(createPostSchema), postController.createPost);
router.get('/pods/:podId/posts', validate(paginationSchema), postController.getPodPosts);

router.get('/posts/saved', protect, postController.getSavedPosts);
router.get('/posts/:postId', postController.getPost);
router.patch('/posts/:postId', protect, validate(updatePostSchema), postController.updatePost);
router.delete('/posts/:postId', protect, postController.deletePost);

router.post('/posts/:postId/like', protect, postController.likePost);
router.delete('/posts/:postId/like', protect, postController.unlikePost);

router.post('/posts/:postId/save', protect, postController.savePost);
router.delete('/posts/:postId/save', protect, postController.unsavePost);

router.post('/posts/:postId/comments', protect, validate(commentSchema), postController.addComment);
router.get('/posts/:postId/comments', validate(paginationSchema), postController.getComments);

router.get('/comments/:commentId/replies', validate(paginationSchema), postController.getReplies);
router.delete('/comments/:commentId', protect, postController.deleteComment);

export default router;

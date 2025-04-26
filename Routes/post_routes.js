// routes/PostRoutes.js

const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post_controller');
const { auth } = require('../middlewares/auth');
const {upload }= require('../middlewares/upload');

// POST create post
router.post('/create', auth, upload.single('picture'), PostController.createPost);

// GET user feed
router.get('/feed/:userId', auth, PostController.getFeed);

router.post('/like/:postId', auth, PostController.likePost);

router.post('/comment/:postId', auth, PostController.addComment);

router.get('/comments/:postId', auth, PostController.getComments);

module.exports = router;

const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authorize.middleware');
const { getMainPage, createBlogForm, createBlog, likeBlog, addComment, nextBlog } = require('../controllers/blog.controller');

// ==================== BLOG ROUTES ====================

// Main blog page (protected)
router.get('/', verifyToken, getMainPage);
router.get('/main', verifyToken, getMainPage);

// Create blog page (protected)
router.get('/create-blog', verifyToken, createBlogForm);
router.post('/create-blog', verifyToken, createBlog);

// Blog interactions (protected)
router.post('/like', verifyToken, likeBlog);
router.post('/comment', verifyToken, addComment);
router.post('/next-blog', verifyToken, nextBlog);

module.exports = router;
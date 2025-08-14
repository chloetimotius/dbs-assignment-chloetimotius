// See https://expressjs.com/en/guide/routing.html for routing

const express = require('express');
const commentsController = require('../controllers/commentsController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

const router = express.Router();

router.use(jwtMiddleware.verifyToken);

// GET all comments for a specific review
router.get('/:review_id', commentsController.retrieveByReview);

// POST create a new comment (supports parent_comment_id for replies)
router.post('/', commentsController.create);

// DELETE a comment
router.delete('/', commentsController.delete);
//router.delete('/:comment_id', commentsController.delete);

module.exports = router;


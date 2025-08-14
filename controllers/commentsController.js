const { EMPTY_RESULT_ERROR, UNIQUE_VIOLATION_ERROR, DUPLICATE_TABLE_ERROR } = require('../errors');
const commentsModel = require('../models/comments');

// Handle comment creation
module.exports.create = async (req, res) => {
    try {
        const memberId = req.user.memberId;
        const { review_id, content, parent_comment_id, product_id } = req.body;

        await commentsModel.create(review_id, memberId, content, parent_comment_id);

        res.redirect(`/product/retrieve?product_id=${product_id}`);
    } catch (err) {
        if (err.code === UNIQUE_VIOLATION_ERROR) {
            res.status(400).send('You have already submitted this comment.');
        } else if (err.code === DUPLICATE_TABLE_ERROR) {
            res.status(500).send('Comments table already exists (unexpected).');
        } else {
            res.status(400).send('Error creating comment: ' + err.message);
        }
    }
};

// Retrieve all comments for a review
module.exports.retrieveByReview = async (req, res) => {
    try {
        const { review_id } = req.params;

        const comments = await commentsModel.getByReviewId(review_id);

        res.json({ comments });
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving comments: ' + err.message });
    }
};

// Handle comment deletion
module.exports.delete = async (req, res) => {
    try {
        const memberId = req.user.memberId;
        const { comment_id, product_id } = req.body;

        console.log('DELETE COMMENT:', { memberId, comment_id, product_id });

        await commentsModel.remove(comment_id, memberId);

        // Don't use res.redirect with JS fetch — return JSON instead
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        if (err.message && err.message.includes('not found for member')) {
            res.status(404).send('Comment not found or not owned by you.');
        } else {
            res.status(400).send('Error deleting comment: ' + err.message);
        }
    }
};

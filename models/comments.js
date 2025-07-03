const { query } = require('../database');
const { EMPTY_RESULT_ERROR, SQL_ERROR_CODE, UNIQUE_VIOLATION_ERROR } = require('../errors');

// 1. Retrieve all comments for a given review (including nested replies)
module.exports.getByReviewId = async function getByReviewId(reviewId) {
  const sql = `SELECT * FROM get_comments($1)`;
  const result = await query(sql, [reviewId]);
  return result.rows;
};

// 2. Create a new comment (can be a top-level comment or a reply)
module.exports.create = async function create(reviewId, memberId, content, parentCommentId = null) {
  const sql = `CALL create_comment($1, $2, $3, $4)`;
  return query(sql, [reviewId, memberId, content, parentCommentId]);
};

// 3. Delete a comment (only by owner)
module.exports.remove = async function remove(commentId, memberId) {
  const sql = `CALL delete_comment($1, $2)`;
  return query(sql, [commentId, memberId]);
};


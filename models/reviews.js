const { query } = require('../database');
const { EMPTY_RESULT_ERROR } = require('../errors');

// 1. Create a new review
module.exports.create = async function create(memberId, productId, orderId, content, rating) {
    const sql = `CALL create_review($1, $2, $3, $4, $5)`;
    return query(sql, [memberId, productId, orderId, content, rating]);
};

// Retrieve all reviews by member
module.exports.retrieveByMember = async function retrieveByMember(memberId) {
    const sql = `SELECT * FROM get_reviews($1, $2)`;
    return query(sql, [memberId, 'member']).then((result) => result.rows);
};

// Retrieve all reviews by product
module.exports.retrieveByProduct = async function retrieveByProduct(productId) {
    const sql = `SELECT * FROM get_reviews($1, $2)`;
    return query(sql, [productId, 'product']).then((result) => result.rows);
};

// 3. Update a review (only by owner)
module.exports.update = async function update(reviewId, memberId, content, rating) {
    const sql = `CALL update_review($1, $2, $3, $4)`;
    return query(sql, [reviewId, memberId, content, rating]);
};

// 4. Delete a review (only by owner)
module.exports.remove = async function remove(reviewId, memberId) {
    const sql = `CALL delete_review($1, $2)`;
    return query(sql, [reviewId, memberId]);
};

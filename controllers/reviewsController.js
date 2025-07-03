const { EMPTY_RESULT_ERROR, UNIQUE_VIOLATION_ERROR, DUPLICATE_TABLE_ERROR } = require('../errors');
const reviewsModel = require('../models/reviews');

// Show the create review form
module.exports.showCreate = (req, res) => {
    res.render('review/create');
};

// Handle review creation
module.exports.create = async (req, res) => {
    try {
        const memberId = req.user.memberId;
        const { product_id, order_id, content, rating } = req.body;

        await reviewsModel.create(memberId, product_id, order_id, content, rating);

        res.redirect('/review/retrieve/all');
    } catch (err) {
        if (err.code === UNIQUE_VIOLATION_ERROR) {
            res.status(400).send('You have already reviewed this product in this order.');
        } else if (err.code === DUPLICATE_TABLE_ERROR) {
            res.status(500).send('Database table already exists (unexpected).');
        } else {
            res.status(400).send('Error creating review: ' + err.message);
        }
    }
};

// Retrieve all reviews by the logged-in member
module.exports.retrieveAll = async (req, res) => {
    try {
        const memberId = req.user.memberId;

        const reviews = await reviewsModel.retrieveByMember(memberId);

        res.json({ reviews });
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving reviews: ' + err.message });
    }
};

// Retrieve reviews for a specific product
module.exports.retrieveByProduct = async (req, res) => {
    try {
        const { productId } = req.query;

        if (!productId) return res.status(400).send('Missing productId');

        const reviews = await reviewsModel.retrieveByProduct(productId);

        res.json({ reviews });
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving reviews: ' + err.message });
    }
};

// Show the update review form
module.exports.showUpdate = (req, res) => {
    const { review_id, content, rating } = req.query;
    res.render('review/update', { review_id, content, rating });
};

// Handle review update
module.exports.update = async (req, res) => {
    try {
        const memberId = req.user.memberId;
        const { review_id, content, rating } = req.body;

        await reviewsModel.update(review_id, memberId, content, rating);

        res.redirect('/review/retrieve/all');
    } catch (err) {
        if (err.code === UNIQUE_VIOLATION_ERROR) {
            res.status(400).send('You are trying to update to a duplicate review.');
        } else {
            res.status(400).send('Error updating review: ' + err.message);
        }
    }
};

// Show the delete confirmation form
module.exports.showDelete = (req, res) => {
    const { review_id } = req.query;
    res.render('review/delete', { review_id });
};

// Handle review deletion
module.exports.delete = async (req, res) => {
    try {
        const memberId = req.user.memberId;
        const { review_id } = req.body;

        await reviewsModel.remove(review_id, memberId);

        res.redirect('/review/retrieve/all');
    } catch (err) {
        if (err instanceof EMPTY_RESULT_ERROR) {
            res.status(404).send('Review not found or not owned by you.');
        } else {
            res.status(400).send('Error deleting review: ' + err.message);
        }
    }
};

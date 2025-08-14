// See https://expressjs.com/en/guide/routing.html for routing

const express = require('express');
const reviewsController = require('../controllers/reviewsController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

const router = express.Router();

// All routes in this file will use the jwtMiddleware to verify the token
// Here the jwtMiddleware is applied at the router level to apply to all routes in this file eg. router.use(...)


// Verify JWT for all review routes
router.use(jwtMiddleware.verifyToken);

// GET create form
router.get('/create', reviewsController.showCreate);

// POST create review
router.post('/create', reviewsController.create);

// GET all reviews
router.get('/retrieve/all', reviewsController.retrieveAll);

// GET all reviews for a specific product by productId query param
router.get('/', reviewsController.retrieveByProduct);

// GET update form
router.get('/update', reviewsController.showUpdate);

// POST update review
router.post('/update', reviewsController.update);

// GET delete confirm page
router.get('/delete', reviewsController.showDelete);

// POST delete review
router.post('/delete', reviewsController.delete);

module.exports = router;

const express = require('express');
const cartController = require('../controllers/cartsController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

const router = express.Router();

// Apply JWT middleware to all routes
router.use(jwtMiddleware.verifyToken);

// Add a new item to cart
router.post('/create', cartController.createCartItems);

// Retrieve all items in the cart (alias for /)
router.get('/', cartController.getCartItems);   // <-- so /carts works

// Update a cart item
router.put('/', cartController.updateCartItems); // <-- so /carts works

// Delete a cart item
router.delete('/delete/:cartItemId', cartController.deleteCartItems);

// Retrieve cart summary
router.get('/summary', cartController.getCartSummary);

// Apply discount
router.get('/discounts', cartController.getCartDiscounts);

module.exports = router;


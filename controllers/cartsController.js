const cartsModel = require('../models/carts');
// -------------------- CART ITEM CONTROLLERS --------------------
// Add an item to the cart
module.exports.createCartItems = async function (req, res) {
    console.log("JWT payload:", req.user);

    try {
        const memberId = req.user.memberId;
        const { productId, quantity } = req.body;

        const qty = Number(quantity);

        if (!productId || isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: 'Invalid product ID or quantity' });
        }

        const newItem = await cartsModel.addItem(memberId, productId, qty);
        return res.status(201).json({ message: 'Item added', item: newItem });

    } catch (err) {
        console.error('Cart error:', err);
        if (err.code === 'P2002') {
            return res.status(409).json({ message: 'Item already exists' });
        }
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update a cart item
module.exports.updateCartItems = async function (req, res) {
    try {
        const memberId = req.user.memberId;
        const { cartItemId, quantity } = req.body;

        const qty = Number(quantity);
        if (!cartItemId || isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: 'Invalid cart item ID or quantity' });
        }

        const updatedItem = await cartsModel.updateItem(memberId, cartItemId, quantity);
        return res.status(200).json({ message: 'Item updated', item: updatedItem });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Retrieve all items in the cart
module.exports.getCartItems = async function (req, res) {
    try {
        const memberId = req.user.memberId;
        const items = await cartsModel.getItems(memberId);

        // Automatically apply discounts when fetching cart
        if (items.length) {
            const updatedCart = await cartsModel.applyDiscounts(items[0].cartId);
            return res.status(200).json({
                cartItems: updatedCart.items,
                cartSummary: {
                    totalItems: updatedCart.totalItems,
                    totalPrice: updatedCart.totalPrice,
                    discountsApplied: updatedCart.discountsApplied
                }
            });
        }

        return res.status(200).json({ cartItems: [], cartSummary: { totalItems: 0, totalPrice: 0, discountsApplied: [] } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a cart item
module.exports.deleteCartItems = async function (req, res) {
    try {
        const memberId = req.user.memberId;
        const { cartItemId } = req.params;

        if (!cartItemId) return res.status(400).json({ message: 'Cart item ID required' });

        await cartsModel.deleteItem(memberId, cartItemId);
        return res.status(200).json({ message: 'Item deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get cart summary (optional, still returns raw total without discounts)
module.exports.getCartSummary = async function (req, res) {
    try {
        const memberId = req.user.memberId;
        const summary = await cartsModel.getSummary(memberId);
        return res.status(200).json({ cartSummary: summary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// -------------------- DISCOUNT LOGIC --------------------

module.exports.getCartDiscounts = async function (req, res) {
    try {
        const memberId = req.user.memberId;
        const cartItems = await cartsModel.getItems(memberId);

        if (!cartItems.length) return res.status(404).json({ message: 'Cart not found' });

        const discountSummary = await cartsModel.applyDiscounts(cartItems[0].cartId);

        return res.status(200).json({
            message: 'Discounts applied successfully',
            discountSummary
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    // Add an item to the cart
    addItem: async (memberId, productId, quantity) => {
        if (!memberId) throw new Error("memberId is required");

        // Find or create cart
        let cart = await prisma.cart.findFirst({
            where: { memberId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { memberId },
            });
        }

        // Check if the item already exists in the cart
        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId },
        });

        if (existingItem) {
            return await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        }

        // Otherwise, create new cart item
        return await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
            },
        });
    },




  // Update a cart item
updateItem: async (memberId, cartItemId, quantity) => {
    console.log('Updating cart item:', cartItemId, 'to quantity:', quantity);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) {
        console.log('Cart item not found');
        throw new Error('Item not found');
    }

    if (cartItem.cart.memberId !== memberId) {
        console.log('Unauthorized: member mismatch');
        throw new Error('Not authorized');
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    console.log('Updated cart item:', updated);
    return updated;
},


  // Get all items in the cart
  getItems: async (memberId) => {
    const cart = await prisma.cart.findFirst({
      where: { memberId },
      include: {
        cartItems: {
          include: { product: true },
        },
      },
    });

    return cart?.cartItems || [];
  },

// Delete a cart item safely
deleteItem: async (memberId, cartItemId) => {
  const id = parseInt(cartItemId, 10);
  const userId = Number(memberId);

  if (isNaN(id)) throw new Error('Invalid cartItemId');

  const cartItem = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true },
  });

  if (!cartItem) {
    console.error(`Cart item with ID ${id} not found`);
    throw new Error('Item not found');
  }

  if (!cartItem.cart || Number(cartItem.cart.memberId) !== userId) {
    console.error(`User ${userId} not authorized to delete cartItem ${id}`);
    throw new Error('Not authorized');
  }

  const deletedItem = await prisma.cartItem.delete({ where: { id } });
  console.log(`Cart item ${id} deleted successfully`);
  return deletedItem;
},


  // Get cart summary
getSummary: async (memberId) => {
  const cart = await prisma.cart.findFirst({
    where: { memberId },
    include: {
      cartItems: { include: { product: true } },
    },
  });

  if (!cart) return { totalItems: 0, totalPrice: 0 };

  let totalItems = 0;
  let totalPrice = 0;

  for (const item of cart.cartItems) {
    totalItems += Number(item.quantity);
    totalPrice += Number(item.quantity) * Number(item.product.unitPrice);
  }

  return { totalItems, totalPrice }; // <-- keep keys consistent
},

// Apply product & cart discounts
applyDiscounts: async (cartId) => {
    const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { cartItems: { include: { product: true } } } // no discount codes needed
    });

    if (!cart) return { totalItems: 0, totalPrice: 0, discountsApplied: [] };

    let totalItems = 0;
    let totalPrice = 0;
    let discountsApplied = [];

    // PRODUCT-LEVEL quantity discounts
    const quantityDiscountTiers = [
        { minQuantity: 3, percent: 10 },
        { minQuantity: 5, percent: 15 }
    ];

    const itemsWithDiscounts = cart.cartItems.map(item => {
        let itemTotal = Number(item.quantity) * Number(item.product.unitPrice);
        let bestDiscount = 0;

        // Apply quantity-based discount
        quantityDiscountTiers.forEach(tier => {
            if (item.quantity >= tier.minQuantity && tier.percent > bestDiscount) {
                bestDiscount = tier.percent;
            }
        });

        if (bestDiscount > 0) {
            itemTotal *= (1 - bestDiscount / 100);
            discountsApplied.push({ code: `QTY-DISCOUNT-${item.product.name}`, amount: bestDiscount });
        }

        totalItems += Number(item.quantity);
        totalPrice += itemTotal;

        return {
            ...item,
            discount: bestDiscount || null,
            subTotal: itemTotal.toFixed(2)
        };
    });

    // CART-LEVEL discount based on total
    const cartLevelDiscounts = [{ minTotal: 100, percent: 5 }];
    cartLevelDiscounts.forEach(d => {
        if (totalPrice >= d.minTotal) {
            totalPrice *= (1 - d.percent / 100);
            discountsApplied.push({ code: `CART-DISCOUNT`, amount: d.percent });
        }
    });

    return {
        totalItems,
        totalPrice: totalPrice.toFixed(2),
        discountsApplied,
        items: itemsWithDiscounts
    };
}
};
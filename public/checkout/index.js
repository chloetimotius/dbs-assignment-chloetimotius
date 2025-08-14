document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const BACKEND_URL = "http://localhost:3000"; // <-- your backend URL and port

    // Initial fetches
    fetchCartItems(token);
    fetchCartSummary(token);
    fetchCartDiscounts(token);

    // Checkout button triggers stored procedure
    const checkoutButton = document.getElementById("checkout-button");
    checkoutButton.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/saleOrders/checkout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            alert(data.message || "Order placed successfully!");

            // Refresh cart info
            setTimeout(() => {
                fetchCartItems(token);
                fetchCartSummary(token);
                fetchCartDiscounts(token);
            }, 500); // small delay to allow server processing
        } catch (err) {
            console.error(err);
            alert("Failed to place order. See console for details.");
        }
    });

    // ------------------------------
    // Fetch cart items
    function fetchCartItems(token) {
        fetch(`${BACKEND_URL}/carts`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                const tbody = document.getElementById("cart-items-tbody");
                tbody.innerHTML = "";

                data.cartItems.forEach(item => {
                    const row = document.createElement("tr");

                    // Product
                    const productCell = document.createElement("td");
                    productCell.textContent = item.product.name || item.product.description;

                    // Unit Price
                    const priceCell = document.createElement("td");
                    priceCell.textContent = `$${Number(item.product.unitPrice).toFixed(2)}`;

                    // Quantity
                    const qtyCell = document.createElement("td");
                    const qtyInput = document.createElement("input");
                    qtyInput.type = "number";
                    qtyInput.min = 1;
                    qtyInput.value = item.quantity;
                    qtyCell.appendChild(qtyInput);

                    // Subtotal
                    const subtotalCell = document.createElement("td");
                    subtotalCell.textContent = `$${Number(item.subTotal || item.quantity * item.product.unitPrice).toFixed(2)}`;

                    // Discount %
                    const discountCell = document.createElement("td");
                    discountCell.textContent = item.discount ? `${item.discount}%` : "-";

                    // Update button
                    const updateCell = document.createElement("td");
                    const updateBtn = document.createElement("button");
                    updateBtn.textContent = "Update";
                    updateBtn.addEventListener("click", () => {
                        fetch(`${BACKEND_URL}/carts`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ cartItemId: item.id, quantity: Number(qtyInput.value) })
                        }).then(() => {
                            fetchCartItems(token);
                            fetchCartSummary(token);
                            fetchCartDiscounts(token);
                        });
                    });
                    updateCell.appendChild(updateBtn);

                    // Delete button
                    const deleteCell = document.createElement("td");
                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "Delete";
                    deleteBtn.addEventListener("click", () => {
                        fetch(`${BACKEND_URL}/carts/delete/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
                            .then(() => {
                                fetchCartItems(token);
                                fetchCartSummary(token);
                                fetchCartDiscounts(token);
                            });
                    });
                    deleteCell.appendChild(deleteBtn);

                    row.append(productCell, priceCell, qtyCell, subtotalCell, discountCell, updateCell, deleteCell);
                    tbody.appendChild(row);
                });
            }).catch(err => console.error(err));
    }

    // ------------------------------
    // Fetch cart summary
    function fetchCartSummary(token) {
        fetch(`${BACKEND_URL}/carts/summary`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(body => {
                const summaryDiv = document.getElementById("cart-summary");
                summaryDiv.innerHTML = "";

                const cartSummary = body.cartSummary;

                summaryDiv.innerHTML = `
                    Total Items: ${cartSummary.totalItems} <br>
                    Total Price: $${Number(cartSummary.totalPrice).toFixed(2)}
                `;
            }).catch(err => console.error(err));
    }

    // ------------------------------
    // Fetch discounts
    function fetchCartDiscounts(token) {
        fetch(`${BACKEND_URL}/carts/discounts`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(body => {
                const discountsDiv = document.getElementById("cart-discounts");
                const discountedDiv = document.getElementById("discounted-subtotal");
                discountsDiv.innerHTML = "";
                discountedDiv.innerHTML = "";

                const discountSummary = body.discountSummary;

                if (discountSummary && discountSummary.discountsApplied.length) {
                    discountSummary.discountsApplied.forEach(d => {
                        const p = document.createElement("p");
                        p.textContent = `${d.code}: ${d.amount}% off`;
                        discountsDiv.appendChild(p);
                    });

                    discountedDiv.textContent = `Discounted Subtotal: $${Number(discountSummary.totalPrice).toFixed(2)}`;
                } else {
                    discountsDiv.textContent = "No discounts applied";
                    discountedDiv.textContent = `Subtotal: $${Number(discountSummary.totalPrice).toFixed(2)}`;
                }
            }).catch(err => console.error(err));
    }

});

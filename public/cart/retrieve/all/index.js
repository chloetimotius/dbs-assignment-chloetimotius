
window.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem("token");

    const checkoutButton = document.getElementById("checkout-button");
    checkoutButton.addEventListener("click", function () {
        window.location.href = "/checkout";
    });

    fetchCartItems(token)
        .then(function () {
            return fetchCartSummary(token);
        });
});

function fetchCartItems(token) {
    return fetch('/carts', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(body => {
        if (body.error) throw new Error(body.error);

        const cartItems = body.cartItems;
        const tbody = document.querySelector("#cart-items-tbody");
        tbody.innerHTML = ""; // Clear existing rows

        cartItems.forEach(cartItem => {
            const row = document.createElement("tr");
            row.classList.add("product");

            // Create cells
            const descriptionCell = document.createElement("td");
            const countryCell = document.createElement("td");
            const unitPriceCell = document.createElement("td");
            const subTotalCell = document.createElement("td");
            const quantityCell = document.createElement("td");
            const updateButtonCell = document.createElement("td");
            const deleteButtonCell = document.createElement("td");

            // Fill cells
            descriptionCell.textContent = cartItem.product.description;
            countryCell.textContent = cartItem.product.country;
            unitPriceCell.textContent = cartItem.product.unitPrice;
            subTotalCell.textContent = cartItem.product.unitPrice * cartItem.quantity;

            // Quantity input
            const quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.value = cartItem.quantity;
            quantityInput.min = 1;
            quantityInput.addEventListener("input", function() {
                this.value = this.value.replace(/[^0-9]/g, "");
            });
            quantityCell.appendChild(quantityInput);

            // Update button
            const updateButton = document.createElement("button");
            updateButton.textContent = "Update";
            updateButton.addEventListener("click", function() {
                const updatedQuantity = Number(quantityInput.value);
                fetch('/carts', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        cartItemId: cartItem.id,
                        quantity: updatedQuantity
                    })
                })
                .then(res => res.json())
                .then(data => {
                    console.log('Update response:', data);
                    location.reload();
                })
                .catch(err => console.error(err));
            });
            updateButtonCell.appendChild(updateButton);

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", function() {
                    console.log("Deleting cartItem with ID:", cartItem.id);  // check this
                if (!confirm("Are you sure you want to delete this item?")) return;

                fetch(`/carts/delete/${cartItem.id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(res => res.json())
                .then(data => {
                    console.log('Delete response:', data);
                    location.reload();
                })
                .catch(err => console.error(err));
            });
            deleteButtonCell.appendChild(deleteButton);

            // Append cells to row
            row.append(
                descriptionCell,
                countryCell,
                subTotalCell,
                unitPriceCell,
                quantityCell,
                updateButtonCell,
                deleteButtonCell
            );

            tbody.appendChild(row);
        });
    })
    .catch(error => console.error(error));
}


function fetchCartSummary(token) {
  return fetch('/carts/summary', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(response => response.json())
  .then(body => {
    if (body.error) throw new Error(body.error);

    const cartSummary = body.cartSummary;
    const cartSummaryDiv = document.querySelector("#cart-summary");

    // Clear previous summary
    cartSummaryDiv.innerHTML = "";

    // Total Quantity
    const quantityLabel = document.createElement("label");
    quantityLabel.textContent = "Total Quantity: ";
    const quantityValue = document.createElement("span");
    quantityValue.textContent = cartSummary.totalItems;

    // Total Price
    const priceLabel = document.createElement("label");
    priceLabel.textContent = "Total Checkout Price: ";
    const priceValue = document.createElement("span");
    priceValue.textContent = cartSummary.totalPrice;

    cartSummaryDiv.appendChild(quantityLabel);
    cartSummaryDiv.appendChild(quantityValue);
    cartSummaryDiv.appendChild(document.createElement("br"));
    cartSummaryDiv.appendChild(priceLabel);
    cartSummaryDiv.appendChild(priceValue);
  })
        .catch(function (error) {
            console.error(error);
        });
}


window.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem("token");

    fetch('/saleOrders', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(body => {
            if (body.error) throw new Error(body.error);
            const saleOrders = body.saleOrders;
            const tbody = document.querySelector("#product-tbody");
            saleOrders.forEach(saleOrder => {
                const row = document.createElement("tr");
                row.classList.add("product");

                const nameCell = document.createElement("td");
                const descriptionCell = document.createElement("td");
                const unitPriceCell = document.createElement("td");
                const quantityCell = document.createElement("td");
                const countryCell = document.createElement("td");
                const imageUrlCell = document.createElement("td");
                const orderIdCell = document.createElement("td");
                const orderDatetimeCell = document.createElement("td");
                const statusCell = document.createElement("td");
                const createReviewCell = document.createElement("td");

                nameCell.textContent = saleOrder.name;
                descriptionCell.textContent = saleOrder.description;
                unitPriceCell.textContent = saleOrder.unitPrice;
                quantityCell.textContent = saleOrder.quantity;
                countryCell.textContent = saleOrder.country;
                imageUrlCell.innerHTML = `<img src="${saleOrder.imageUrl}" alt="Product Image" width="100">`;
                orderIdCell.textContent = saleOrder.saleOrderId;
                orderDatetimeCell.textContent = new Date(saleOrder.orderDatetime).toLocaleString();
                statusCell.textContent = saleOrder.status;

                const viewProductButton = document.createElement("button");
                viewProductButton.textContent = "Create Review";
                viewProductButton.addEventListener('click', function () {
                    const reviewForm = document.querySelector("#review-form");
                    reviewForm.style.display = 'block';

                    document.querySelector("input[name='productId']").value = saleOrder.productId;
                    document.querySelector("input[name='orderId']").value = saleOrder.saleOrderId;
                    document.querySelector("#review-product-id").innerText = saleOrder.name;
                });
                createReviewCell.appendChild(viewProductButton);

                row.appendChild(nameCell);
                row.appendChild(descriptionCell);
                row.appendChild(imageUrlCell);
                row.appendChild(unitPriceCell);
                row.appendChild(quantityCell);
                row.appendChild(countryCell);
                row.appendChild(orderIdCell);
                row.appendChild(orderDatetimeCell);
                row.appendChild(statusCell);
                row.appendChild(createReviewCell);

                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error(error);
        });

    const reviewForm = document.querySelector("#review-form");
    reviewForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const productId = document.querySelector("input[name='productId']").value;
        const orderId = document.querySelector("input[name='orderId']").value;
        const content = document.querySelector("textarea[name='reviewText']").value;
        const rating = document.querySelector("input[name='rating']").value;

        fetch("/reviews/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: productId,
                order_id: orderId,
                content: content,
                rating: rating
            })
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(msg => { throw new Error(msg); });
                }
                return response.text();
            })
            .then(() => {
                alert("Review submitted successfully!");
                window.location.href = "/review/retrieve/all";
            })
            .catch(err => {
                alert("Error submitting review: " + err.message);
            });
    });
});

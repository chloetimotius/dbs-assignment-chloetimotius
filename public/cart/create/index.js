window.addEventListener('DOMContentLoaded', function () { 
    const token = localStorage.getItem("token");
    const cartProductId = localStorage.getItem("cartProductId");

    // Fill the product ID input
    const productIdInput = document.querySelector("input[name='productId']");
    productIdInput.value = cartProductId;

    // Select the form
    const addToCartForm = document.querySelector("form"); // Using querySelector for your form
    addToCartForm.addEventListener("submit", function (e) {
        e.preventDefault(); // prevent default form submission

        const quantity = Number(document.querySelector("input[name='quantity']").value);

        // Make POST request to /carts/create
        fetch('/carts/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: Number(cartProductId),
                quantity
            })
        })
        .then(res => res.json())
        .then(body => {
            if (body.error) {
                alert(body.error);
            } else {
                alert("Item added to cart!");
            }
        })
        .catch(err => console.error(err));
    });
});

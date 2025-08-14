window.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const reviewId = localStorage.getItem('reviewId');
    console.log('Token:', token);
    console.log('ReviewId:', reviewId);

    if (!token) {
        alert('You must be logged in to update a review.');
        window.location.href = '/login';
        return;
    }

    const form = document.querySelector('form');
    form.querySelector('input[name=reviewId]').value = reviewId;

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const rating = form.querySelector('select[name=rating]').value;
    const content = form.querySelector('textarea[name=reviewText]').value;

    const body = {
        review_id: reviewId,
        rating,
        content
    };

    try {
        const response = await fetch('/reviews/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to update review');
        }

        localStorage.removeItem('reviewId');  // cleanup
        window.location.href = '/review/retrieve/all';  // <-- this must be a real HTML page


    } catch (err) {
        alert('Error updating review: ' + err.message);
        console.error(err);
    }
});
});

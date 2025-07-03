// you can modify the code 
// you will need to add code to handle the form submission

window.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const reviewId = localStorage.getItem('reviewId');

    if (!token || !reviewId) {
        alert('Missing token or review ID');
        window.location.href = '/review/retrieve/all';
        return;
    }

    const form = document.querySelector('form');
    form.querySelector('input[name=reviewId]').value = reviewId;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        try {
            const response = await fetch('/reviews/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ review_id: reviewId })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to delete review');
            }

            localStorage.removeItem('reviewId');
            alert('Review deleted successfully.');
            window.location.href = '/review/retrieve/all';

        } catch (err) {
            alert('Error deleting review: ' + err.message);
            console.error(err);
        }
    });
});


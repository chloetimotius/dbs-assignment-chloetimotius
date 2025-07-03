function fetchUserReview() {
	const token = localStorage.getItem('token');
	const reviewId = localStorage.getItem('reviewId');

	if (!token || !reviewId) {
		alert('Missing token or review ID');
		return;
	}

	return fetch(`/reviews/retrieve/${reviewId}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Failed to retrieve review');
			}
			return response.json();
		})
		.then(body => {
			// Populate the update form with the review data
			const form = document.querySelector('form');
			form.querySelector('input[name=reviewId]').value = body.review.reviewid;
			form.querySelector('select[name=rating]').value = body.review.rating;
			form.querySelector('textarea[name=reviewText]').value = body.review.content;
		})
		.catch(error => {
			console.error(error);
			alert('Could not load review details.');
		});
}

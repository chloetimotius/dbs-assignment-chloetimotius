function fetchProduct(productId) {
    const token = localStorage.getItem("token");

    return fetch(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(body => {
        if (body.error) throw new Error(body.error);
        const product = body.product;
        const tbody = document.querySelector("#product-tbody");
        tbody.innerHTML = ''; // Clear any old content

        const row = document.createElement("tr");
        row.classList.add("product");

        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.description}</td>
            <td>${product.unitPrice}</td>
            <td>${product.country}</td>
            <td>${product.productType}</td>
            <td><img src="${product.imageUrl}" alt="Product Image" style="max-width: 100px;"></td>
            <td>${new Date(product.manufacturedOn).toLocaleString()}</td>
        `;

        tbody.appendChild(row);
    })
    .catch(console.error);
}

function fetchCommentsForReview(reviewId) {
    const token = localStorage.getItem("token");
    return fetch(`/comments/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(body => {
        if (body.error) throw new Error(body.error);

        // Normalize keys to match your existing code
        const normalized = body.comments.map(c => ({
            comment_id: c.commentId,
            member_id: c.memberId,
            username: c.username, 
            parent_comment_id: c.parentCommentId,
            content: c.content,
            created_at: c.createdAt
        }));

        return normalized;
    });
}


// Helper: build nested comments tree
function buildNestedComments(comments) {
    const map = {};
    const roots = [];

    comments.forEach(c => {
        c.children = [];
        map[c.comment_id] = c;
    });

    comments.forEach(c => {
        if (c.parent_comment_id) {
            map[c.parent_comment_id]?.children.push(c);
        } else {
            roots.push(c);
        }
    });

    return roots;
}

// Render a comment with its nested replies recursively
function renderComment(comment) {
    const currentUserId = parseInt(localStorage.getItem('memberId')); // get logged-in user

    const div = document.createElement('div');
    div.classList.add('comment');
    div.style.marginLeft = comment.parent_comment_id ? '20px' : '0';

    // Include Delete button only if the comment belongs to the user
    const isOwner = comment.member_id === currentUserId;
    const deleteBtn = isOwner ? `<button class="delete-button" data-comment-id="${comment.comment_id}">Delete</button>` : '';

    div.innerHTML = `
        <p><strong>Member:</strong> ${comment.username || comment.member_id}</p>
        <p>${comment.content}</p>
        <p><small>${comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Unknown date'}</small></p>
        <button class="reply-button" data-comment-id="${comment.comment_id}">Reply</button>
        ${deleteBtn}
    `;

    if (comment.children.length > 0) {
        const childrenContainer = document.createElement('div');
        comment.children.forEach(child => {
            childrenContainer.appendChild(renderComment(child));
        });
        div.appendChild(childrenContainer);
    }

    return div;
}


function fetchProductReviews(productId) {
    const token = localStorage.getItem("token");

    return fetch(`/reviews?productId=${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(async body => {
        if (body.error) throw new Error(body.error);

        const reviews = body.reviews;
        const reviewsContainer = document.querySelector('#reviews-container');
        reviewsContainer.innerHTML = ''; // Clear previous content

        for (const review of reviews) {
            const reviewDiv = document.createElement('div');
            reviewDiv.classList.add('review-row');

            let ratingStars = '⭐'.repeat(review.rating);

            reviewDiv.innerHTML = `
                <h3>Member Username: ${review.username || 'N/A'}</h3>
                <p>Rating: ${ratingStars}</p>
                <p>Review Text: ${review.content}</p>
                <p>Last Updated: ${review.createdat ? new Date(review.createdat).toLocaleString() : ""}</p>
                <div class="comments-container" id="comments-for-review-${review.reviewid}">
                    <h4>Comments:</h4>
                    <div class="comments-list"></div>
                    <form class="comment-form" data-review-id="${review.reviewid}">
                        <textarea name="content" placeholder="Write a comment..." required></textarea>
                        <input type="hidden" name="parent_comment_id" value="">
                        <button type="submit">Submit Comment</button>
                    </form>
                </div>
            `;

            reviewsContainer.appendChild(reviewDiv);

            // Fetch and render comments for this review
            const comments = await fetchCommentsForReview(review.reviewid);
            const nestedComments = buildNestedComments(comments);
            const commentsListDiv = reviewDiv.querySelector('.comments-list');
            nestedComments.forEach(comment => {
                commentsListDiv.appendChild(renderComment(comment));
            });
            addDeleteButtonListeners();
        }

        addCommentFormListeners();
    })
    .catch(console.error);
}

// Add event listeners for comment forms and reply buttons
function addCommentFormListeners() {
    // Submit new comment or reply
    document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const reviewId = form.dataset.reviewId;
            const content = form.querySelector('textarea[name="content"]').value.trim();
            const parentCommentId = form.querySelector('input[name="parent_comment_id"]').value || null;
            const productId = localStorage.getItem("productId");

            if (!content) {
                alert('Comment cannot be empty.');
                return;
            }

            const token = localStorage.getItem("token");
            fetch('/comments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ review_id: reviewId, content, parent_comment_id: parentCommentId, product_id: productId })
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to create comment');
                return res.text();
            })
            .then(() => {
                form.querySelector('textarea[name="content"]').value = '';
                form.querySelector('input[name="parent_comment_id"]').value = '';
                // Refresh comments for this review
                fetchCommentsForReview(reviewId).then(comments => {
                    const nested = buildNestedComments(comments);
                    const commentsListDiv = form.closest('.comments-container').querySelector('.comments-list');
                    commentsListDiv.innerHTML = '';
                    nested.forEach(c => commentsListDiv.appendChild(renderComment(c)));
                    addReplyButtonListeners(); // Rebind reply buttons
                    addDeleteButtonListeners();
                    
                });
            })
            .catch(console.error);
        });
    });

    addReplyButtonListeners();
}

// Add reply button listeners separately to re-bind after DOM updates
function addReplyButtonListeners() {
    document.querySelectorAll('.reply-button').forEach(button => {
        button.onclick = () => {
            const commentId = button.dataset.commentId;
            const form = button.closest('.comments-container').querySelector('.comment-form');
            form.querySelector('input[name="parent_comment_id"]').value = commentId;
            form.querySelector('textarea[name="content"]').focus();
        };
    });
}

function addDeleteButtonListeners() {
    document.querySelectorAll('.delete-button').forEach(button => {
        button.onclick = () => {
            const commentId = button.dataset.commentId;
            const productId = localStorage.getItem("productId");

            if (!confirm("Are you sure you want to delete this comment?")) return;

            const token = localStorage.getItem("token");

            fetch('/comments/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    comment_id: commentId,
                    product_id: productId
                })
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to delete comment');
                return res.json(); // we now return JSON from the backend
            })
            .then(() => {
                // Reload comments after deletion
                fetchProductReviews(productId);
            })
            .catch(err => {
                alert('Error deleting comment: ' + err.message);
                console.error(err);
            });
        };
    });
}




document.addEventListener('DOMContentLoaded', () => {
    const productId = localStorage.getItem("productId");
    fetchProduct(productId)
        .then(() => fetchProductReviews(productId))
        .catch(console.error);
});


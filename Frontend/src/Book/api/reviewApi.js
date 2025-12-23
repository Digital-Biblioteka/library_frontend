const API_BASE = "http://localhost:8080/api"

export async function createReview(bookId, review){
    console.log(review)
    const res = await fetch ( `${API_BASE}/books/reviews/${bookId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(review)
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Не удалось создать отзыв: ${msg}`);
    }
}

export async function getBookReviews(bookId){
    const res = await fetch ( `${API_BASE}/books/reviews/${bookId}`, {
        method: "GET"
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Не удалось получить отзывы: ${msg}`);
        return [];
    }

    return await res.json()
}

export async function editReview(review, reviewId) {
    const res = await fetch(`${API_BASE}/books/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(review)
    })

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Не удалось отредактировать отзыв: ${msg}`);
    }
}

export async function deleteReview (reviewId) {
    console.log(reviewId)
    const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Не удалось удалить отзыв: ${msg}`);
    }
}

export async function getUserReviews() {
    const res = await fetch(`${API_BASE}/profile/reviews`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    if (!res.ok) {
        const msg = await res.text();
        console.error(`Не удалось получить все отзывы пользователя: ${msg}`);
    }

    return await res.json();
}


const API_BASE = "http://localhost:8080/api/bookmarks"

export async function addBookmark (bookId, bookmark) {
    const res = await fetch(`${API_BASE}/${bookId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bookmark)
    });

    if(!res.ok) {
        const err = await res.text();
        console.error(`Ошибка добавления закладки: ${err}`)
    }

    return await res.json()
}

export async function getUsersBookmarks (bookId) {
    const res = await fetch(`${API_BASE}/${bookId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })

    if (!res.ok) {
        const err = await res.text();
        console.error(`Ошибка получения закладок: ${err}`);
        return [];
    }

    return await res.json()
}

export async function editBookmark (bookmarkId, newBookmark) {
    const res = await fetch(`${API_BASE}/${bookmarkId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newBookmark)
    })

    if(!res.ok) {
        const err = await res.text();
        console.error(`Ошибка редактирования закладки: ${err}`)
    }

    return await res.json()
}

export async function deleteBookmark (bookmarkId, newBookmark) {
    const res = await fetch(`${API_BASE}/${bookmarkId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    })

    if(!res.ok) {
        const err = await res.text();
        console.error(`Ошибка удаления закладки: ${err}`)
    }
}
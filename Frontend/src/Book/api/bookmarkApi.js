const API_BASE = "http://localhost:8080/api/bookmarks"

export async function addBookmark (bookId, bookmark) {
    console.log(bookmark)

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

export async function getUsersBookmarksGroups (bookId) {
    const res = await fetch(`${API_BASE}/${bookId}/groups`, {
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

export async function createBookmarksGroup (bookId, bookmarkGroupInfo) {
    const params = new URLSearchParams({
        name: bookmarkGroupInfo.name,
        visibility: bookmarkGroupInfo.visibility
    });

    const res = await fetch(`${API_BASE}/groups/${bookId}?${params.toString()}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        }
    })

    if(!res.ok) {
        const err = await res.text();
        console.error(`Ошибка создания группы закладок: ${err}`)
    }

    return await res.json();
}

export async function deleteBookmarkGroup (groupId) {
    const res = await fetch(`${API_BASE}/groups/${groupId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    })

    if(!res.ok) {
        const err = await res.text();
        console.error(`Ошибка удаления группы закладок: ${err}`)
    }
}

export async function addBookmarkToGroup (bookmarkId, groupId) {
    const res = await fetch(`${API_BASE}/${bookmarkId}/group/${groupId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        }
    });

    if(!res.ok) {
        const err = await res.text();
        console.error(`Ошибка добавления закладки в группу: ${err}`)
    }
}

export async function getAllBookmarksInGroup (groupId) {
    const res = await fetch(`${API_BASE}/groups/${groupId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })

    if (!res.ok) {
        const err = await res.text();
        console.error(`Ошибка получения закладок группы: ${err}`);
        return [];
    }

    return await res.json()
}

export async function joinBookmarksGroup (accessToken) {
    const res = await fetch(`${API_BASE}/groups/join/${accessToken}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    })

    if(!res.ok) {
        const err = await res.text();
        console.error(`Ошибка присоединения: ${err}`)
    }
}

export async function getAllUsersInGroup(groupId) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/members`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    })

    if(!res.ok) {
        const err = await res.text();
        console.error(`Ошибка получения юзеров: ${err}`)
    }

    return await res.json();
}








const API_BASE = "http://localhost:8080/api/groups"

export async function createGroup(groupData) {
    const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(groupData)
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка создания группы: ${msg}`)
    }

    return res.json();
}

export async function getAllGroups() {
    const res = await fetch(`${API_BASE}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения групп: ${msg}`)
    }

    return res.json();
}

export async function upgradeGroup(groupId, groupData) {
    const res = await fetch(`${API_BASE}/${groupId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(groupData)
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка редактирования группы: ${msg}`)
    }

    return res.json();
}

export async function addUserToGroup(groupId, userEmail) {
    const res = await fetch(`${API_BASE}/${groupId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ email: userEmail })
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка добавления пользователя в группу: ${msg}`)
    }

    return res.json();
}

//-------------------------------------------------------------BOOK LIMITS-----------------------------------------------------------

export async function giveBookLimits(groupId, bookLim) {
    console.log(bookLim)

    const res = await fetch(`${API_BASE}/${groupId}/books/limits`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(bookLim)
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка добавления лимитов: ${msg}`)
    }

    return res.json();
}

export async function getBookLimits(groupId) {
    const res = await fetch(`${API_BASE}/${groupId}/books/limits`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения лимитов: ${msg}`)
    }

    return res.json();
}

export async function updateBookLimits(bookLimId, bookLim) {
    const res = await fetch(`${API_BASE}/books/limits/${bookLimId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(bookLim)
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка редактирования лимита: ${msg}`)
    }

    return res.json();
}

export async function getAllBookLimits() {
    const res = await fetch(`${API_BASE}/book/limits`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения лимитов: ${msg}`)
    }

    return res.json();
}
//-------------------------------------------------------------BOOK LIMIT REQUESTS-----------------------------------------------------------

export async function getAllLimitRequests() {
    const res = await fetch(`${API_BASE}/limits/requests`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения запросов на лимиты: ${msg}`)
    }

    return res.json();
}

export async function approveLimitRequest(requestId) {
    const res = await fetch(`${API_BASE}/limits/requests/${requestId}/approve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка одобрения запроса на лимит: ${msg}`)
    }

    return res.json();
}

export async function rejectLimitRequest(requestId) {
    const res = await fetch(`${API_BASE}/limits/requests/${requestId}/reject`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка отклонения запроса на лимит: ${msg}`)
    }

    return res.json();
}

//-------------------------------------------------------------CATEGORY LIMIT REQUESTS-----------------------------------------------------------

export async function getAllCategoryLimitRequests() {
    const res = await fetch(`${API_BASE}/categories/limits/requests`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения запросов на лимиты категорий: ${msg}`)
    }

    return res.json();
}

export async function approveCategoryLimitRequest(requestId) {
    const res = await fetch(`${API_BASE}/categories/limits/requests/${requestId}/approve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка одобрения запроса на лимит категории: ${msg}`)
    }

    return res.json();
}

export async function rejectCategoryLimitRequest(requestId) {
    const res = await fetch(`${API_BASE}/categories/limits/requests/${requestId}/reject`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка отклонения запроса на лимит категории: ${msg}`)
    }

    return res.json();
}

const CATEGORY_API = "http://localhost:8080/api/categories";

// ------------------------ BOOK SETS ------------------------

export async function getAllBookSets() {
    const res = await fetch(`${CATEGORY_API}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка получения book-sets: ${msg}`);
    }

    return res.json();
}

export async function createBookSet(bookSet) {
    const res = await fetch(`${CATEGORY_API}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(bookSet)
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка создания book-set: ${msg}`);
    }

    return res.json();
}

export async function updateBookSet(id, bookSet) {
    const res = await fetch(`${CATEGORY_API}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(bookSet)
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка обновления book-set: ${msg}`);
    }

    return res.json();
}

export async function deleteBookSet(id) {
    const res = await fetch(`${CATEGORY_API}/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка удаления book-set: ${msg}`);
    }
}

export async function getBooksInBookSet(id) {
    const res = await fetch(`${CATEGORY_API}/${id}/books`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка получения книг book-set: ${msg}`);
    }

    return res.json();
}

export async function addBookToBookSet(bookSetId, bookId) {
    const res = await fetch(`${CATEGORY_API}/${bookSetId}/books/${bookId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка добавления книги в book-set: ${msg}`);
    }

    return res.json();
}

export async function removeBookFromBookSet(bookSetId, bookId) {
    const res = await fetch(`${CATEGORY_API}/${bookSetId}/books/${bookId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка удаления книги из book-set: ${msg}`);
    }
}
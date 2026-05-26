const API_BASE = "http://localhost:8080/api"

export async function getAllGroups() {

    const res = await fetch(`${API_BASE}/librarian/groups`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения групп: ${msg}`)
    }

    return res.json();
}


export async function getGroupUsers(id) {
    const res = await fetch(`${API_BASE}/librarian/groups/${id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения группы: ${msg}`)
    }

    return res.json();
}


export async function addUserToGroup(groupId, userEmail) {
    const res = await fetch(`${API_BASE}/librarian/groups/${groupId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ email: userEmail })
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка добавления в группу: ${msg}`)
    }

    return res.json();
}

export async function getAccessRequestsByGroup(groupId) {
    const res = await fetch(`${API_BASE}/librarian/requests/groups/${groupId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения запросов на доступ: ${msg}`)
    }

    return res.json();
}

export async function approveAccessRequest(requestId) {
    const res = await fetch(`${API_BASE}/librarian/requests/${requestId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка одобрения запроса: ${msg}`)
    }

    return res.json();
}

export async function createLimitRequest(groupId, bookId, requestedLimit) {
    const res = await fetch(`${API_BASE}/librarian/limits/requests`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            groupID: groupId,
            bookID: bookId,
            requestedLimit: requestedLimit
        })
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка создания запроса на лимит: ${msg}`)
    }

    return res.json();
}

export async function getLimitRequestsByGroup(groupId) {
    const res = await fetch(`${API_BASE}/librarian/limits/requests/${groupId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения запросов на лимиты группы: ${msg}`)
    }

    return res.json();
}

export async function getAllMyLimitRequests() {
    const res = await fetch(`${API_BASE}/librarian/limits/requests`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения всех запросов на лимиты: ${msg}`)
    }

    return res.json();
}

export async function getCategoryAccessRequestsByGroup(groupId) {
    const res = await fetch(`${API_BASE}/librarian/categories/requests/${groupId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения запросов на категории: ${msg}`)
    }

    return res.json();
}

export async function approveCategoryAccessRequest(requestId) {
    const res = await fetch(`${API_BASE}/librarian/categories/requests/${requestId}/approve`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка одобрения запроса на категорию: ${msg}`)
    }

    return res.json();
}

export async function rejectCategoryAccessRequest(requestId) {
    const res = await fetch(`${API_BASE}/librarian/categories/requests/${requestId}/reject`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка отклонения запроса на категорию: ${msg}`)
    }

    return res.json();
}

export async function createCategoryLimitRequest(groupId, categoryId, requestedLimit) {
    const res = await fetch(`${API_BASE}/librarian/categories/limits/requests`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            groupID: groupId,
            categoryID: categoryId,
            requestedLimit: requestedLimit
        })
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка создания запроса на лимит категории: ${msg}`)
    }

    return res.json();
}

export async function getMyCategoryLimitRequests() {
    const res = await fetch(`${API_BASE}/librarian/categories/limits/requests`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения запросов на лимиты категорий: ${msg}`)
    }

    return res.json();
}

export async function getCategoryLimitRequestsByGroup(groupId) {
    const res = await fetch(`${API_BASE}/librarian/categories/limits/requests/${groupId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения запросов на лимиты категорий группы: ${msg}`)
    }

    return res.json();
}
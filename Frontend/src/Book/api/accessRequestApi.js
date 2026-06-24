const API_BASE = "http://localhost:8080/api"

export async function getUserGroups() {
    const res = await fetch(`${API_BASE}/groups/user`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения групп пользователя: ${msg}`)
    }

    return res.json();
}

export async function createBookAccessRequest(bookId, groupId) {
    const res = await fetch(`${API_BASE}/books/${bookId}/access`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ groupID: groupId })
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка создания запроса на доступ к книге: ${msg}`)
    }

    return res.json();
}

export async function getMyBookAccessRequests() {
    const res = await fetch(`${API_BASE}/books/access`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения запросов на доступ к книгам: ${msg}`)
    }

    return res.json();
}

export async function tryOpenBook(id) {
    const res = await fetch(`${API_BASE}/reader/${id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    const text = await res.text();

    if (!res.ok) {
        const error = new Error(text || "Нет доступа к книге");
        error.status = res.status;
        throw error;
    }

    return text;
}

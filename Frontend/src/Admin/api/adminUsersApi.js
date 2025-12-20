const API_BASE = "http://localhost:8080/api/admin/users"

export async function getAllUsers () {
    const res = await fetch(`${API_BASE}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = res.text();
        console.error(`Ошибка получения пользователей: ${msg}`)
    }

    return res.json();
}

export async function createUser (userData) {
    const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: userData
    });

    if (!res.ok) {
        const msg = res.text();
        console.error(`Ошибка добавления пользователя: ${msg}`)
    }

    return res.json();
}

export async function deleteUser(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка удаления пользователя: ${msg}`);
    }
}

export async function editUser(id, user) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(user)
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка редактировния данных книги: ${msg}`);
    }
}

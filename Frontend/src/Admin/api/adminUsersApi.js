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


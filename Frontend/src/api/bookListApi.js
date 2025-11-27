const API_BASE = "http://localhost:8080/api";

export async function getAllBooks() {
    const res = await fetch ( `${API_BASE}/admin/books`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Не удалось получить список книг: ${msg}`);
    }

    return await res.json()
}


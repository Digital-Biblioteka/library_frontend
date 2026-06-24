const API_BASE = "http://localhost:8080/api/admin/books";
const PUBLIC_API = "http://localhost:8080/api/books";

export async function getPublicBooks() {
    const headers = {};
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(PUBLIC_API, { headers });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Не удалось получить список книг: ${msg}`);
    }
    return await res.json();
}

export async function addBook(bookData) {
    console.log(bookData)
    console.log("[addBook API] sending request, token:", localStorage.getItem("token")?.substring(0, 20) + "...");
    const res = await fetch ( `${API_BASE}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        body: bookData
    });
    console.log("[addBook API] response status:", res.status);

    if (!res.ok) {
        const msg = await res.text();
        console.error("[addBook API] error response:", msg);
        throw new Error(`Ошибка загрузки книги на сервер: ${msg}`);
    }
}

export async function getAllBooks() {
    const res = await fetch ( `${API_BASE}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Не удалось получить список книг: ${msg}`);
    }

    return await res.json()
}

export async function getAllPrivateBooks() {
    const res = await fetch ( `${API_BASE}/private`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Не удалось получить список книг: ${msg}`);
    }

    return await res.json()
}

export async function elasticAdmin () {
    const res = await fetch(`${API_BASE}/elastic`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка индексации: ${msg}`);
        return;
    }

    const data = await res.json();
    console.log(data);
}

export async function deleteBook(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка удаления книги: ${msg}`);
    }
}

export async function editBook(id, book) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(book)
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка редактировния данных книги: ${msg}`);
        return;
    }

    const data = await res.json();
    console.log(data);
}
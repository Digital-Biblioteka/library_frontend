const API_BASE = "http://localhost:8080/api/admin/books";

export async function addBook(bookData) {
    const res = await fetch ( `${API_BASE}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        body: bookData
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка загрузки книги на сервер: ${msg}`);
    }
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
        throw new Error(`Ошибка удаления книги: ${msg}`);
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
        throw new Error(`Ошибка редактировния данных книги: ${msg}`);
    }
}
const API_BASE = "http://localhost:8080/api/admin/books";

export async function addBook(bookData) {
    const res = await fetch ( `${API_BASE}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        body: JSON.stringify(bookData)
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка загрузки книги на сервер: ${msg}`);
    }
}

export async function deleteBook(isbn) {
    const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: isbn
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка удаления книги: ${msg}`);
    }
}
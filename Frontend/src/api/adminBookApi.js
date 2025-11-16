const API_BASE = "http://localhost:8080/api/admin";

export async function addBook(bookData) {
    const res = await fetch ( `${API_BASE}/books/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
                     "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        body: JSON.stringify(bookData),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка загрузки книги на сервер: ${msg}`);
    }
}
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

// @GetMapping("admin/books/elastic")
// public List<Book> putBooksInElastic() {
//     List<Book> books = getBooks();
//     for (Book book : books) {
//         searchIndexClient.indexBook(book);
//     }
//     return books;
// }

export async function elasticAdmin () {
    const res = await fetch(`${API_BASE}/elastic`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка удаления книги: ${msg}`);
    }

    console.log(await res.json())
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
    }

    console.log(await res.json())
}
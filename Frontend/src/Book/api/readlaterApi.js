const API_BASE = "http://localhost:8080/api/read-later"

export async function addBookToList(id) {
    const res = await fetch ( `${API_BASE}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(id)
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка добавления книги в рид латер: ${msg}`);
    }
}

export async function getReadLaterList(){
    const res = await fetch ( `${API_BASE}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Не удалось получить список книг: ${msg}`);
    }

    return await res.json()
}

export async function deleteReadLaterBook(id) {
    const res = await fetch (`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Не удалось удалить книгу: ${msg}`);
    }
}


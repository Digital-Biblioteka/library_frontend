const API_BASE = "http://localhost:8080/api/last-read"

export async function getLastReadList(){
    const res = await fetch ( `${API_BASE}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Не удалось получить список книг: ${msg}`);
    }

    return await res.json()
}

export async function deleteLastReadBook(id) {
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
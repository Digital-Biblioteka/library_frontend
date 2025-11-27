const API_BASE = "http://localhost:8080/api/reader"

export async function openBook(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "GET",
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка открывания книги: ${msg}`);
    }

    return res.text()
}
const API_BASE = "http://localhost:8080/api/search/content";

export async function searchContent(query, bookId = null, size = 10) {
    const body = { query, size };
    if (bookId) body.book_id = String(bookId);

    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка поиска по цитате: ${msg}`);
    }

    return await res.json();
}

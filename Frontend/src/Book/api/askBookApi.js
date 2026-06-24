const API_BASE = "http://localhost:8080/api/search/ask";

export async function askBook(question, bookId, topK = 10) {
    const body = { question, book_id: String(bookId), top_k: topK };

    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка запроса к книге: ${msg}`);
    }

    return await res.json();
}
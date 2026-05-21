const API_BASE = "http://localhost:8080/api/search/books";
const SUGGEST_BASE = "http://localhost:8080/api/search/suggest";

export async function searchBook(params) {
    const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: params
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка поиска книг: ${msg}`);
    }

    return await res.json();
}

export async function suggestBook(prefix, size = 10) {
    if (!prefix || !prefix.trim()) return [];

    const url = `${SUGGEST_BASE}?prefix=${encodeURIComponent(prefix)}&size=${size}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            return [];
        }
        return await res.json();
    } catch (e) {
        console.error("Ошибка автодополнения:", e);
        return [];
    }
}
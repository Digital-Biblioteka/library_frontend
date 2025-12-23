const API_BASE = "http://localhost:8080/api/search/books";

export async function searchBook(query) {
    const res = await fetch ( `${API_BASE}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: query
    });

    console.log(query)

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка поиска книг: ${msg}`);
    }

    console.log(await res.json())
    //return await res.json()
}

// export async function searchBook(query) {
//     const res = await fetch ( `${API_BASE}`, {
//         method: "GET",
//     });

//     if (!res.ok) {
//         const msg = await res.text();
//         throw new Error(`Ошибка поиска книг: ${msg}`);
//     }

//     return await res.json()
// }
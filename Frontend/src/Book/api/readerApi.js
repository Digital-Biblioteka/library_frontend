const API_BASE = "http://localhost:8080/api/reader"

export async function openBook(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });


    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка открывания книги: ${msg}`);
    }

    return res.text()
}

export async function getBookPreview(id) {
    const res = await fetch(`${API_BASE}/${id}/preview`, {
        method:"GET",
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка загрузки превью книги: ${msg}`);
    }

    return res.text()
}

export async function postReadingPos(id, position){
    console.log(position)

    const res = await fetch(`${API_BASE}/${id}/pos`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(position)
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка отправки последней позиции чтения: ${msg}`);
    }
}

export async function getLastReadingPos(id) {
    const res = await fetch( `${API_BASE}/${id}/pos`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });
    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения последней позиции чтения: ${msg}`);
        return null
    }

    //console.log(res.text())

    return await res.json()
}
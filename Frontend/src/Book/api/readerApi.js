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

export async function postReadingPos(id, position) {
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

    return await res.json()
}

export async function getToc(bookId) {
    const res = await fetch(`${API_BASE}/${bookId}/toc`, {
        method: "GET"
    });

    if(!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения оглавления: ${msg}`);
    }

    //console.log(await res.json())
    return await res.json()
}

export async function getChapByToc(bookId, toc) {

    const res = await fetch (`${API_BASE}/${bookId}/toc/chapter`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`

        },
        body: JSON.stringify(toc)
    })

    if(!res.ok) {
        const msg = await res.text()
        console.error(`Ошибка получения главы: ${msg}`);
    }

    return await res.json();
}

export async function getChapByIdx(bookId, spineIdx) {
    const res = await fetch (`${API_BASE}/${bookId}/chapter/${spineIdx}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })

    if(!res.ok) {
        const msg = await res.text()
        throw new Error(`Ошибка получения главы: ${msg}`);
    }

    return await res.json();
}

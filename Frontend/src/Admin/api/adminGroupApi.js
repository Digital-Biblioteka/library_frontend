const API_BASE = "http://localhost:8080/api/groups"

export async function createGroup(groupData) {
    const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(groupData)
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка создания группы: ${msg}`)
    }

    return res.json();
}

export async function getAllGroups() {
    const res = await fetch(`${API_BASE}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения групп: ${msg}`)
    }

    return res.json();
}

export async function upgradeGroup(groupId, groupData) {
    const res = await fetch(`${API_BASE}/${groupId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(groupData)
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка редактирования группы: ${msg}`)
    }

    return res.json();
}

//-------------------------------------------------------------BOOK LIMITS-----------------------------------------------------------

export async function giveBookLimits(groupId, bookLim) {
    const res = await fetch(`${API_BASE}/${groupId}/book/limits`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(bookLim)
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка добавления лимитов: ${msg}`)
    }

    return res.json();
}

export async function getBookLimits(groupId) {
    const res = await fetch(`${API_BASE}/${groupId}/book/limits`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения лимитов: ${msg}`)
    }

    return res.json();
}

export async function updateBookLimits(bookLimId, bookLim) {
    const res = await fetch(`${API_BASE}/book/limits/${bookLimId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(bookLim)
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка редактирования лимита: ${msg}`)
    }

    return res.json();
}

export async function getAllBookLimits() {
    const res = await fetch(`${API_BASE}/book/limits`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Ошибка получения лимитов: ${msg}`)
    }

    return res.json();
}


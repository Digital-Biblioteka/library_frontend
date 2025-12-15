export async function getGenres() {
    const res = await fetch("http://localhost:8080/api/genres");

    if (!res.ok) {
        console.error("Не удалось загрузить жанры");
    }

    const data = await res.json();

    // приводим к формату react-select
    return data.map(g => ({
        value: g.id,
        label: g.genreName
    }));
}

export async function addGenre(genreName) {
    const res = await fetch("http://localhost:8080/api/admin/genres", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({genreName: genreName }),
    });

    if (!res.ok) {
        const msg = await res.text();
        console.error(`Не удалось добавить новый жанр: ${msg}`)
    }

    return await res.json()
}

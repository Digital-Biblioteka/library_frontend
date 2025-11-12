const API_BASE = "http://localhost:8080/auth";

/**
 * @param {Object} userData { username, email, password }
 * @returns {Promise<{token: string}>}
 */
export async function signUp(userData) {
    const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка регистрации: ${msg}`);
    }

    return res.json();
}

/**
 * @param {Object} credentials { username, password }
 * @returns {Promise<{token: string}>}
 */
export async function signIn(credentials) {
    const res = await fetch(`${API_BASE}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Ошибка входа: ${msg}`);
    }

    return res.json();
}
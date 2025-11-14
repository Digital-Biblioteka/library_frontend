export function TokenParser() {
    const token = localStorage.getItem("token");

    if(!token) return null;

    try {
        const parsed = JSON.parse(atob(token.split('.')[1]));
        return {
            username: parsed.username || "NO NAME!!!!",
            role: parsed.role
        }
    } catch (e) {
        console.log(e.message)
    }
}

export function getUsername() {
    const parser = TokenParser();
    return parser?.username || "NO NAME";
}


export function getRole() {
    const parser = TokenParser();
    return parser?.role || "";
}

export function logout() {
    localStorage.removeItem("token");
    window.location.reload("/");
}
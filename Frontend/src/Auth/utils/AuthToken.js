import {jwtDecode} from "jwt-decode";

export function TokenParser() {
    const token = localStorage.getItem("token");

    if(!token) return null;

    try {
        const parsed = jwtDecode(token);
        return {
            username: parsed.username || "NO NAME!!!!",
            role: parsed.role,
            email: parsed.email,
            id: parsed.id
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

export function getEmail() {
    const parser = TokenParser();
    return parser?.email || "";
}

export function getId() {
    const p = TokenParser();
    return p?.id;
}

export function logout() {
    localStorage.removeItem("token");
    window.location.reload("/");
}
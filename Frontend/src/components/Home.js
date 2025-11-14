import React from "react";
import HomeGuest from "./home pages/HomeGuest";
import HomeUser from "./home pages/HomeUser";
import HomeAdmin from "./home pages/HomeAdmin";
import "../style/home.css";
import { getRole } from "../utils/AuthToken";

function HomePage() {
    const role = getRole();

    if (role === "ROLE_ADMIN") return <HomeAdmin />;
    if (role === "ROLE_USER") return <HomeUser />;
    return <HomeGuest />;
}

export default HomePage;

import React from "react";
import HomeGuest from "./HomeGuest";
import HomeUser from "./HomeUser";
import HomeAdmin from "../Admin/HomeAdmin";
import "./home.css";
import { getRole } from "../Auth/utils/AuthToken";

function HomePage() {
    const role = getRole();

    if (role === "ROLE_ADMIN") return <HomeAdmin />;
    if (role === "ROLE_USER") return <HomeUser />;
    return <HomeGuest />;
}

export default HomePage;

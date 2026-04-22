import React from "react";
import HomeGuest from "./User(Home pages)/HomeGuest";
import HomeUser from "./User(Home pages)/HomeUser";
import HomeAdmin from "./Admin/HomeAdmin";
import "./User(Home pages)/home.css";
import { getRole } from "./Auth/utils/AuthToken";

function HomePage() {
    const role = getRole();

    if (role === "ROLE_ADMIN") return <HomeAdmin />;
    if (role === "ROLE_USER") return <HomeUser />;
    return <HomeGuest />;
}

export default HomePage;

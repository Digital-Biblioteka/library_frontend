import React from "react";
import HomeGuest from "./home pages/HomeGuest";
import HomeUser from "./home pages/HomeUser";
import HomeAdmin from "./home pages/HomeAdmin";
import "../style/home.css";
//import { getUserRole } from "../utils/auth";

function HomePage() {
    const role = "ADMIN"//getUserRole();

    if (role === "ADMIN") return <HomeAdmin />;
    if (role === "USER") return <HomeUser />;
    return <HomeGuest />;
}

export default HomePage;

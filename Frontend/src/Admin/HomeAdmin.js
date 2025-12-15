import { getUsername, logout } from "../Auth/utils/AuthToken";
import "../User(Home pages)/home.css";
import "./admin-home.css"
import WorkWIthBookModal from "./modals/AdminAddBookModal";
import {useState} from "react";

export default function HomeAdmin() {
    const username = getUsername();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="Home">
            <div className="home-admin">
                <div className="header">
                    <label className="hello-user">Рады вас видеть, {username}</label>

                    <div className="buttons-party">
                        <button className="logout-btn"
                            onClick={logout}>
                            Выйти
                        </button>
                    </div>
                </div>

                <label className="label">Панель администратора</label>

                <div className="admin-panel">
                    <button className="admin-button"
                        onClick={() => setIsModalOpen(true)}>
                        Управление книгами</button>
                    <button className="admin-button">Управление пользователями</button>
                </div>

                <WorkWIthBookModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </div>
        </div>
    );
}

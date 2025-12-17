import { getUsername, logout } from "../Auth/utils/AuthToken";
import "../User(Home pages)/home.css";
import "./admin-home.css"
import WorkWIthBookModal from "./modals/AdminAddBookModal";
import {useState} from "react";
import WorkWithUsersModal from "./modals/AdminUsersModal";

export default function HomeAdmin() {
    const username = getUsername();
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false)

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
                        onClick={() => setIsBookModalOpen(true)}>
                        Управление книгами
                    </button>
                    <button className="admin-button"
                            onClick={() => setIsUserModalOpen(true)}>
                        Управление пользователями
                    </button>
                </div>

                <WorkWIthBookModal
                    isOpen={isBookModalOpen}
                    onClose={() => setIsBookModalOpen(false)}
                />

                <WorkWithUsersModal
                    isOpen={isUserModalOpen}
                    onClose={() => setIsUserModalOpen(false)}
                />
            </div>
        </div>
    );
}

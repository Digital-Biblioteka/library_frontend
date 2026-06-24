import { getUsername, logout } from "../Auth/utils/AuthToken";
import "../User(Home pages)/home.css";
import "./admin-home.css"
import "../buttons.css"
import WorkWIthBookModal from "./modals/AdminAddBookModal";
import {useState} from "react";
import WorkWithUsersModal from "./modals/AdminUsersModal";
import AdminRequestsModal from "./modals/AdminRequestsModal";
import AdminBookSetsModal from "./modals/AdminBookSetModal";
import { reindexAllBooks } from "./api/adminBookApi";


export default function HomeAdmin() {
    const username = getUsername();
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false)
    const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false)
    const [reindexingAll, setReindexingAll] = useState(false);
    const [isBookSetsModalOpen, setIsBookSetsModalOpen] = useState(false);

    const handleReindexAll = async () => {
        if (!window.confirm("Переиндексировать все книги? Это может занять некоторое время.")) return;
        setReindexingAll(true);
        try {
            const msg = await reindexAllBooks();
            alert(msg);
        } catch (err) {
            alert(err.message);
        } finally {
            setReindexingAll(false);
        }
    };


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

                <div className="admin-panel">
                    <label className="label" >Панель администратора</label>
                    <button className="admin-button"
                            onClick={() => setIsBookModalOpen(true)}>
                        Управление книгами
                    </button>
                    <button className="admin-button"
                            onClick={() => setIsUserModalOpen(true)}>
                        Управление пользователями
                    </button>
                    <button className="admin-button"
                            onClick={() => setIsRequestsModalOpen(true)}>
                        Запросы на лимиты
                    </button>
                    <button
                        className="admin-button"
                        onClick={() => setIsBookSetsModalOpen(true)}
                    >
                        Управление book-sets
                    </button>

                    <button className="admin-button"
                            onClick={handleReindexAll}
                            disabled={reindexingAll}>
                        {reindexingAll ? "Переиндексация..." : "Переиндексировать все книги"}
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

                <AdminRequestsModal
                    isOpen={isRequestsModalOpen}
                    onClose={() => setIsRequestsModalOpen(false)}
                />

                <AdminBookSetsModal
                    isOpen={isBookSetsModalOpen}
                    onClose={() => setIsBookSetsModalOpen(false)}
                />
            </div>
        </div>
    );
}
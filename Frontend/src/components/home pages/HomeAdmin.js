//import { getUsername, logout } from "../utils/auth";
import "../../style/home.css";
import "../../style/admin-home.css"

export default function HomeAdmin() {
    //const username = getUsername();

    return (
        <div className="Home">
            <div className="home-admin">
                <div className="header">
                    <label className="hello-user">Hello, {}</label>

                    <div className="buttons-party">
                        <button className="logout-btn"
                            //onClick={}
                        >
                            Выйти
                        </button>
                    </div>
                </div>

                <label className="label">Панель администратора</label>

                <div className="admin-panel">
                    <button className="admin-button">Добавить книгу</button>
                    <button className="admin-button">Управление пользователями</button>
                </div>
            </div>
        </div>
    );
}

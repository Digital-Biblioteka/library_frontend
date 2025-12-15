import {useNavigate} from "react-router-dom";
import SearchField from "../Book/SearchField";
import "./home.css";

function HomeGuest() {
    const navigate = useNavigate();

    return (
        <div className="Home">
            <div className="header">
                <label className="hello-user"> Рады видеть у нас в гостях!</label>
                <div className="buttons-party">
                    <button className="sign-in-btn"
                            onClick={() => navigate("/sign-in")}>
                        Войти
                    </button>

                    <button className="sign-up-btn"
                            onClick={() => navigate("/sign-up")}>
                        Зарегистрироваться
                    </button>
                </div>
            </div>

            <label className="label"> Cупер мега крутая онлайн библиотека класс вау 💯</label>
            <SearchField/>
        </div>
    );
}

export default HomeGuest;
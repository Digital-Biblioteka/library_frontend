import {useNavigate} from "react-router-dom";
import {useState} from "react";
import "../../style/home.css";

function HomeGuest() {
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');

    const handleChange = (e) => {
        setSearchValue(e.target.value);
    };

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

            <div className="search-container">
                <input
                    placeholder="я ищу..."
                    className="search-field"
                    onChange={handleChange}
                />
                <button
                    className="search-btn"
                    onClick={() => navigate("/reader")}
                >
                    Поиск
                </button>
            </div>
        </div>
    );
}

export default HomeGuest;
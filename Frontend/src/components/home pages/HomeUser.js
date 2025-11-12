import {useNavigate} from "react-router-dom";
import {useState} from "react";
import "../../style/home.css";
import "../../style/user-home.css"
//import { getUserName, logout } from "../utils/auth";

function HomeUser() {
    //const username = getUsername();
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');

    const [activeTab, setActiveTab] = useState("reading");

    const handleChange = (e) => {
        setSearchValue(e.target.value);
    };

    return (
        <div className="Home">

            <div className="home-user">
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

                <div className="user-tabs">
                    <button
                        className={`tab ${activeTab === "reading" ? "active" : ""}`}
                        onClick={() => setActiveTab("reading")}
                    >
                        Я читаю
                    </button>
                    <button
                        className={`tab ${activeTab === "want" ? "active" : ""}`}
                        onClick={() => setActiveTab("want")}
                    >
                        Хочу почитать
                    </button>
                    <button
                        className={`tab ${activeTab === "review" ? "active" : ""}`}
                        onClick={() => setActiveTab("review")}
                    >
                        Мои отзывы
                    </button>
                </div>

                <div className="book-list">
                    <text>ТУТА БУДУТ КНИГИЫ</text>
                </div>

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
        </div>
    );
}

export default HomeUser;
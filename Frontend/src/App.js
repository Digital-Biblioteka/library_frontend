import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Reader from "./Reader";
import SignIn from "./Sign In";
import {useState} from "react";


function HomePage() {
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('я ищу...');
    const [isDefault, setIsDefault] = useState(true);

    const handleFocus = () => {
        if (isDefault) {
            setSearchValue('');
            setIsDefault(false);
        }
    };

    const handleBlur = () => {
        if (searchValue === '') {
            setSearchValue('я ищу...');
            setIsDefault(true);
        }
    };

    const handleChange = (e) => {
        setSearchValue(e.target.value);
    };

    return (
        <div className="Home">
            <div className="header">
                <button className="sign-in-btn"
                        onClick={() => navigate("/sign-in")}>
                    Войти
                </button>

                <button className="sign-up-btn"
                        onClick={() => navigate("/sign-up")}>
                    Зарегистрироваться
                </button>
            </div>

            <div className="search-container">
                <input
                    className="search-field"
                    value={searchValue}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
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

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/reader" element={<Reader />} />
                <Route path="/sign-in" element={<SignIn />}></Route>
            </Routes>
        </Router>
    );
}

export default App;

import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Reader from "./Reader";
import SignIn from "./Sign In";


function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="App">
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

            <input className="search-field"
                   defaultValue="я ищу..."
            />
            <button
                className="search-btn"
                onClick={() => navigate("/reader")}
            >
                Поиск
            </button>
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

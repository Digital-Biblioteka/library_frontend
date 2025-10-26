import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Reader from "./Reader";
import SignIn from "./Sign In";

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="App">
            <button
                className="open-book-btn"
                onClick={() => navigate("/reader")}
            >
                ХОЧУ ЧИТАТЬ!!!
            </button>

            <button className="sing-up-btn"
                    onClick={() => navigate("/sign-in")}>
                Sing IN
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

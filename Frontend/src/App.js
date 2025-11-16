import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Reader from "./components/Reader";
import AuthForm from "./components/Auth";
import HomePage from "./components/Home";
import BooksList from "./components/BooksList";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/reader" element={<Reader />} />
                <Route path="/sign-in" element={<AuthForm mode="signin" />}></Route>
                <Route path="/sign-up" element={<AuthForm mode="signup" />}></Route>
                <Route path="/book-list" element={<BooksList />}></Route>
            </Routes>
        </Router>
    );
}

export default App;

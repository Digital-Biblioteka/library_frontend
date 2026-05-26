import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Reader from "./Book/Reader";
import AuthForm from "./Auth/Auth";
import HomePage from "./Home";
import BooksList from "./Book/BooksList";
import HomeLibr from "./Librerian/HomeLibr";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/reader" element={<Reader />} />
                <Route path="/sign-in" element={<AuthForm mode="signin" />}></Route>
                <Route path="/sign-up" element={<AuthForm mode="signup" />}></Route>
                <Route path="/book-list" element={<BooksList />}></Route>
                <Route path="/libr" element={<HomeLibr />}></Route>
            </Routes>
        </Router>
    );
}

export default App;

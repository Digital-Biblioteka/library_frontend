import React, { useEffect, useState } from "react";
import { getAllBooks } from "../api/bookListApi";
import { useNavigate } from "react-router-dom";
import "../style/book-list.css";
import AdminEditorModal from "./home pages/admin tools/AdminBookWork";
import {getRole} from "../utils/AuthToken";
import {genres} from "./home pages/admin tools/Genres";
import Select from "react-select";

export default function BooksList() {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState('');


    useEffect(() => {
        getAllBooks().then(async (loadedBooks) => {
            setBooks(loadedBooks);
        }).catch(console.error);
    }, []);

    const handleChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleBookClick = (book) => {
        if (getRole() === "ROLE_ADMIN") {
            setIsModalOpen(true);
            setSelectedBook(book);
        } else {
            navigate("/reader")
        }
    }

    return (
        <div className="books-wrapper">

            <div className="top-bar">
                <button className="back-btn" onClick={() => navigate("/")}> ↩ </button>
                <h1>Cупер мега крутая онлайн библиотека класс вау 💯</h1>
                <div>
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

            <div className="content-area ">

                <div className="filters">
                    <h3>Фильтры</h3>
                    <label>Жанры:</label>
                    <Select
                        options={genres}
                        placeholder="Выберите жанр..."
                        //value={genres.find((g))}
                        //onChange={(option) => formik.setFieldValue("genre", option.value)}
                        classNamePrefix="rs"
                    />
                </div>

                <div className="books-grid">
                    {books.map((book) => (
                        <div
                            className="book-card"
                            key={book.id}
                            onClick={() => handleBookClick(book)}
                        >
                            <img
                                src={"/kitten_uwuwuwuwuw.jpg"}
                                alt={book.title}
                                className="book-cover"
                            />
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-author">{book.author}</p>
                        </div>
                    ))}
                </div>
            </div>

            <AdminEditorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen()}
                book={selectedBook}
            />
        </div>
    );
}

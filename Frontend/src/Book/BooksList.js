import React, { useEffect, useState } from "react";
import { getAllBooks } from "./api/bookListApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./book-list.css";
import AdminEditorModal from "../Admin/modals/AdminBookEditModal";
import {getRole} from "../Auth/utils/AuthToken";
import {Genres} from "./Genres";
import Select from "react-select";
import SearchField from "./SearchField";
import {searchBook} from "./api/searchApi";
import UserBookModal from "../User(Home pages)/UserBookModal";
import BookCard from "./BookCard";

export default function BooksList() {
    const [books, setBooks] = useState([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isAdminModalOpen, setAdminIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState('');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [genres, setGenres] = useState([])

    const query = searchParams.get("query");

    const params = searchParams.get("search");

    useEffect(() => {
        Genres().then(setGenres);
    }, []);


    useEffect(() => {
        if (params) {
            searchBook(params).then(async (loadedBooks) => {
                setBooks(loadedBooks);
            }).catch(console.error);
        } else {
            if(getRole() === "ROLE_ADMIN"){
                getAllBooks().then(async (loadedBooks) => {
                    setBooks(loadedBooks);
                }).catch(console.error);
            }
        }
    }, [params]);

    const handleBookClick = (book) => {
        setSelectedBook(book);
        if (getRole() === "ROLE_ADMIN") {
            setAdminIsModalOpen(true);
        } else {
            setIsUserModalOpen(true);
        }
    }

    return (
        <div className="books-wrapper">

            <div className="top-bar">
                <button className="back-btn" onClick={() => navigate("/")}> ↩ </button>
                <h1>Cупер мега крутая онлайн библиотека класс вау 💯</h1>
                <SearchField/>
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
                    {books.length === 0 ? (
                        <p className="empty-result">По вашему запросу "{query}" ничего не найдено</p>
                    ) : (
                        books.map((book) => (
                            <BookCard
                                key = {book.id}
                                id = {book.id}
                                book = {book}
                                onClick = {() => handleBookClick(book)}
                            />
                        ))
                    )}
                </div>
            </div>

            <AdminEditorModal
                isOpen={isAdminModalOpen}
                onClose={() => setAdminIsModalOpen()}
                book={selectedBook}
            />

            <UserBookModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                book={selectedBook}
                id={selectedBook.id}
            />

        </div>
    );
}

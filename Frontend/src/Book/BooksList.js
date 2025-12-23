import React, { useEffect, useState } from "react";
import {elasticAdmin, getAllBooks} from "../Admin/api/adminBookApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./book-list.css";
import AdminEditorModal from "../Admin/modals/AdminBookEditModal";
import {getRole} from "../Auth/utils/AuthToken";
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

    const query = searchParams.get("query");

    const params = searchParams.get("search");

    useEffect(() => {
        if (params) {
            searchBook(params).then(async (loadedBooks) => {
                setBooks(loadedBooks);
                console.log(loadedBooks)
            }).catch(console.error);
        } else {
            if(getRole() === "ROLE_ADMIN"){
                getAllBooks().then(async (loadedBooks) => {
                    setBooks(loadedBooks);
                }).catch(console.error);
                void elasticAdmin();
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
                onClose={() => setAdminIsModalOpen(false)}
                book={selectedBook}
                onBookUpdated={(updatedBook) => {
                    setBooks(prev =>
                        prev.map(b => b.id === updatedBook.id ? updatedBook : b)
                    );
                }}
                onBookDeleted={(id) => {
                    setBooks(prev => prev.filter(b => b.id !== id));
                }}
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

import React, {useEffect, useState} from "react";
import "./home.css";
import "./user-home.css"
import {getUsername, logout} from "../Auth/utils/AuthToken";
import SearchField from "../Book/SearchField";
import {getReadLaterList} from "../Book/api/readlaterApi";
import UserBookModal from "./UserBookModal";
import BookCard from "../Book/BookCard";
import {deleteLastReadBook, getLastReadList} from "../Book/api/lastReadApi";

function HomeUser() {
    const username = getUsername();
    const [activeTab, setActiveTab] = useState("reading");
    const [booksList, setBooksList] = useState([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [id, setId] = useState(null);

    useEffect(() => {
        if (activeTab === "want") {
            getReadLaterList()
                .then((books) => setBooksList(books))
                .catch((err) => console.error(err));
        }
        if (activeTab === "reading") {
            getLastReadList()
                .then((books) => setBooksList(books))
                .catch((err) => console.error(err));
        }
    }, [activeTab]);


    const handleBookClick = (book) => {
        setSelectedBook(book.book);
        setId(book.bookId)
        setIsModalOpen(true);
    }

    const handleDeleteFromList = (bookId) => {
        if (activeTab === "reading") {
            deleteLastReadBook(bookId)
                .then(() => window.location.reload())
                .catch(err => console.error("Ошибка удаления книги:", err));
        }
    }

    return (
        <div className="Home">

            <div className="home-user">
                <div className="header">
                    <label className="hello-user">Рады вас видеть, {username}</label>

                    <div className="buttons-party">
                        <button className="logout-btn"
                            onClick={logout}
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
                    {activeTab === "want" && (
                        <>
                            {booksList.length === 0 ? (
                                <p>Здесь появятся книги, которые вы хотите прочитать</p>
                            ) : (
                                <div className="want-books-grid">
                                    {booksList.map((book) => (
                                        <div className="book-card-wr" key = {book.bookId}>
                                            <BookCard
                                                id = {book.bookId}
                                                book = {book.book}
                                                onClick = {() => handleBookClick(book)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "reading" && (
                        <>
                            {booksList.length === 0 ? (
                                <p>Здесь появятся книги, которые вы начали читать</p>
                            ) : (
                                <div className="last-books-grid">
                                    {booksList.map((book) => (
                                        <div className="book-card-wr" key = {book.bookId}>
                                            <BookCard
                                                id = {book.bookId}
                                                book = {book.book}
                                                onClick = {() => handleBookClick(book)}
                                            />
                                            <button className="close-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteFromList(book.bookId);
                                                    }}>
                                                🗑
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "review" && (
                        <p>Тут будут отзывы</p>
                    )}
                    <UserBookModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        book={selectedBook}
                        id={id}
                    />
                </div>
                <SearchField/>
            </div>
        </div>
    );
}

export default HomeUser;
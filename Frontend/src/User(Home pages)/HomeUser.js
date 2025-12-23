import React, {useEffect, useState} from "react";
import "./home.css";
import "./user-home.css"
import {getUsername, logout} from "../Auth/utils/AuthToken";
import SearchField from "../Book/SearchField";
import {getReadLaterList} from "../Book/api/readlaterApi";
import UserBookModal from "./UserBookModal";
import BookCard from "../Book/BookCard";
import {deleteLastReadBook, getLastReadList} from "../Book/api/lastReadApi";
import {deleteReview, getUserReviews} from "../Book/api/reviewApi";
import StarRating from "../Book/Stars";

function HomeUser() {
    const username = getUsername();
    const [activeTab, setActiveTab] = useState("reading");
    const [booksList, setBooksList] = useState([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [id, setId] = useState(null);
    const [reviews, setReviews] = useState([]);

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
        if (activeTab === "review") {
            getUserReviews()
                .then((reviews) => setReviews(reviews))
                .catch((err) => console.error(err));
        }
    }, [activeTab]);


    const handleBookClick = (book) => {
        setSelectedBook(book.book);
        setId(book.bookId)
        setIsModalOpen(true);
    }

    const handleDeleteFromList = (bookId) => {
        deleteLastReadBook(bookId)
            .then(() => {
                setBooksList(prev => prev.filter(book => book.bookId !== bookId))
            })
            .catch(err => console.error("Ошибка удаления книги:", err));
    }

    const handleDeleteReview = (reviewId) => {
        deleteReview(reviewId)
            .then(() => {
                // Обновляем state: убираем удалённый отзыв
                setReviews(prevReviews =>
                    prevReviews.filter(review => review.id !== reviewId)
                );
            })
            .catch(err => console.error("Ошибка удаления книги:", err));
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
                        <>
                            {reviews.length === 0 ? (
                                <p>Вы ещё не оставили ни одного отзыва</p>
                            ) : (
                                <div className="reviews-list-grid">
                                    {reviews.map((review) => (
                                        <div className="review-with-book" key={review.id}>
                                            <div className="review-card">
                                                <div className="review-left">
                                                    <div className="review-text">
                                                        {review.review_text}
                                                    </div>
                                                </div>
                                                <div className="review-right">
                                                    <StarRating
                                                        value={review.rating}
                                                        readOnly
                                                        size={18}
                                                    />
                                                    <button className="close-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteReview(review.id);
                                                            }}>
                                                        🗑
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="book-card-small">
                                                <BookCard
                                                    id={review.book.id}
                                                    book={review.book}
                                                    onClick={() =>
                                                        handleBookClick({
                                                            book: review.book,
                                                            bookId: review.book.id
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
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
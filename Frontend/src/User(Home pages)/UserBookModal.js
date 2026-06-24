import React, { useEffect, useState } from "react";
import "./modal-window.css";
import { useNavigate } from "react-router-dom";
import { openBook } from "../Book/api/readerApi";
import { addBookToList, deleteReadLaterBook, getReadLaterList } from "../Book/api/readlaterApi";
import ReviewsModal from "../Book/ReviewModal";
import BookAccessRequestModal from "./BookAccessRequestModal";
import {tryOpenBook} from "../Book/api/accessRequestApi";

export default function UserBookModal({ isOpen, onClose, book, id }) {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reviewsOpen, setReviewsOpen] = useState(false);
    const [accessRequestOpen, setAccessRequestOpen] = useState(false);

    useEffect(() => {
        if (!isOpen || !token || !id) return;

        getReadLaterList()
            .then(list => {
                setLiked(list.some(b => b.bookId === id));
            })
            .catch(console.error);
    }, [id, isOpen, token]);

    const handleOpenBook = async () => {
        try {
            if (token) {
                await tryOpenBook(id);
                navigate("/reader", { state: { title: book.title, id } });
                return;
            }

            navigate("/reader", { state: { title: book.title, id } });
        } catch (e) {
            console.error("Ошибка открытия книги:", e);

            if (token && (e.status === 403 || e.status === 401)) {
                setAccessRequestOpen(true);
            }
        }
    };

    const toggleLike = async () => {
        if (!token || loading) return;
        setLoading(true);
        const newLiked = !liked;
        setLiked(newLiked);

        try {
            if (newLiked) {
                await addBookToList(id);
            } else {
                await deleteReadLaterBook(id);
                onClose()
                window.location.reload()
            }
        } catch (e) {
            console.error("Ошибка при изменении лайка:", e);
            setLiked(!newLiked); // откатываем при ошибке
        } finally {
            setLoading(false);
        }
    };


    if (!isOpen || !book) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-window" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{book.title}</h2>
                    <button className="close-btn" onClick={onClose}>X</button>
                </div>
                <div className="modal-content">
                    <p><b>Автор:</b> {book.author}</p>
                    <p><b>Жанр:</b> {book.genre.genreName}</p>
                    <p><b>Описание:</b> {book.description}</p>
                </div>
                <div className="modal-buttons">
                    <button className="add-btn" onClick={handleOpenBook}>Читать</button>
                    <button className="action-btn" onClick={() => setReviewsOpen(true)}>Отзывы</button>
                    {token && (
                        <button
                            className={`heart-btn ${liked ? "liked" : ""}`}
                            onClick={toggleLike}
                            disabled={loading}
                            title={liked ? "Убрать из читать позже" : "Добавить в читать позже"}
                        >
                            {liked ? "❤️" : "🤍"}
                        </button>
                    )}
                </div>
                <ReviewsModal
                    bookId={id}
                    isOpen={reviewsOpen}
                    onClose={() => setReviewsOpen(false)}
                />
                <BookAccessRequestModal
                    bookId={id}
                    book={book}
                    isOpen={accessRequestOpen}
                    onClose={() => setAccessRequestOpen(false)}
                />
            </div>
        </div>
    );
}

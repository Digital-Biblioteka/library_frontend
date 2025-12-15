import React, {useState} from "react";
import "./modal-window.css";
import {useNavigate} from "react-router-dom";
import {openBook} from "../Book/api/readerApi";
import {addBookToList} from "../Book/api/readlaterApi";

export default function UserBookModal({ isOpen, onClose, book, id }) {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    if (!isOpen || !book) return null;

    const handleOpenBook = async () => {
        let bookToOpen = await openBook(id)
        console.log(bookToOpen)

        navigate("/reader", {state: {url: bookToOpen, title: book.title, id: id}})
    }

    const handleReadLaterBook = async () => {
        await addBookToList(id)
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-window"
                onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{book.title}</h2>
                    <button className="close-btn" onClick={onClose}>X</button>
                </div>
                <div className="modal-content">
                    <p><b>Автор:</b> {book.author}</p>
                    <p><b>Жанр:</b> {book.genre}</p>
                    <p><b>Описание:</b> {book.description}</p>
                </div>
                <div className="modal-buttons">
                    <button className="add-btn" onClick={handleOpenBook}>
                        Читать
                    </button>
                    {token && (
                        <button className="action-btn" onClick={handleReadLaterBook}>
                            Читать позже
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
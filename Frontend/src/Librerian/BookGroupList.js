import React from "react";
import BookCard from "../Book/BookCard";

export default function BooksGroupList({ books, onClose, onRequestLimit }) {
    return (
        <section className="content-card">
            <div className="section-header">
                <div>
                    <h2>Книги группы</h2>
                </div>
                <button className="action-btn" onClick={onClose}>Назад к пользователям</button>
            </div>

            {books.length === 0 ? (
                <p className="state-message">Нет книг, выделенных для группы</p>
            ) : (
                <div className="books-list">
                    {books.map((book) => (
                        <div className="book-access-row" key={book.id}>
                            <div className="book-card-preview">
                                <BookCard id={book.id} book={book} isRatingViewed={false} />
                            </div>
                            <div className="book-access-info">
                                <div>
                                    <span className="limit-label">Доступно: </span>
                                    <span className={`limit-value ${book.available === 0 ? "out-of-stock" : ""}`}>
                                        {book.available ?? 0} / {book.limit ?? 0}
                                    </span>
                                </div>
                                <button className="add-btn" onClick={() => onRequestLimit?.(book)}>
                                    {book.available === 0 ? "Запросить еще" : "Изменить лимит"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

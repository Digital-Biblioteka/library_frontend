import React from "react";
import BookCard from "../Book/BookCard";

export default function BooksGroupList({ selectedGroup, books, onClose, onRequestLimit }) {
    function handleRequestLimit(bookItem) {
        const book = bookItem.book;

        const currentLimit = bookItem.limit ?? 0;

        const value = window.prompt(
            `Введите новый лимит для книги "${book.title}"`,
            currentLimit > 0 ? String(currentLimit) : "1"
        );

        if (value === null) return;

        const requestedLimit = Number(value);

        if (!Number.isInteger(requestedLimit) || requestedLimit <= 0) {
            alert("Лимит должен быть положительным числом");
            return;
        }

        onRequestLimit?.({
            groupID: selectedGroup.id,
            bookID: book.id,
            limit: requestedLimit
        });
    }

    return (
        <section className="content-card">
            <div className="section-header">
                <div>
                    <h2>Книги группы {selectedGroup.name}</h2>
                </div>
                <button className="action-btn" onClick={onClose}>
                    Back to users-list
                </button>
            </div>

            {books.length === 0 ? (
                <p className="state-message">No books for current group</p>
            ) : (
                <div className="books-list">
                    {books.map((bookItem) => {
                        const book = bookItem.book;
                        const limit = bookItem.limit ?? 0;

                        return (
                            <div className="book-access-row" key={book.id}>
                                <div>
                                    <span className="limit-label">Available: </span>
                                    <span className="limit-value">{limit}</span>
                                </div>

                                <div className="book-card-preview">
                                    <BookCard
                                        id={book.id}
                                        book={book}
                                        isRatingViewed={true}
                                    />
                                </div>

                                <button
                                    className="add-btn"
                                    onClick={() => handleRequestLimit(bookItem)}
                                >
                                    {limit === 0 ? "Запросить еще" : "Изменить лимит"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
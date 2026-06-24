import React from "react";
import BookCard from "../Book/BookCard";

export default function BooksGroupList({ selectedGroup, books, onClose, onRequestLimit }) {
    return (
        <section className="content-card">
            <div className="section-header">
                <div>
                    <h2>Книги группы {selectedGroup.name}</h2>
                </div>
                <button className="action-btn" onClick={onClose}>Back to users-list</button>
            </div>

            {books.length === 0 ? (
                <p className="state-message">No books for current group</p>
            ) : (
                <div className="books-list">
                    {books.map((book) => (
                        <div className="book-access-row" key={book.id}>
                            <div>
                                <span className="limit-label">Available: </span>
                                <span className={`limit-value`}>
                                        {book.limit ?? 0}
                                    </span>
                            </div>
                            <div className="book-card-preview">
                                <BookCard id={book.book.id} book={book.book} isRatingViewed={true} />
                            </div>
                            <button
                                className="add-btn"
                                onClick={() =>
                                    onRequestLimit?.({
                                        groupId: selectedGroup.id,
                                        bookId: book.book.id,
                                        bookTitle: book.book.title,
                                        requestedLimit: 10,
                                    })
                                }>
                                {book.limit === 0 ? "Ask more" : "Change Limit"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

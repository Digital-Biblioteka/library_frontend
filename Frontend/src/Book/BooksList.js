import React, { useEffect, useState } from "react";
import {getPublicBooks} from "../Admin/api/adminBookApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./book-list.css";
import AdminEditorModal from "../Admin/modals/AdminBookEditModal";
import {getRole} from "../Auth/utils/AuthToken";
import SearchField from "./SearchField";
import {searchBook} from "./api/searchApi";
import {searchContent} from "./api/contentSearchApi";
import UserBookModal from "../User(Home pages)/UserBookModal";
import BookCard from "./BookCard";
import ContentSearchResultCard from "./ContentSearchResultCard";

export default function BooksList() {
    const [books, setBooks] = useState([]);
    const [contentResults, setContentResults] = useState([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isAdminModalOpen, setAdminIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState('');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    const query = searchParams.get("query");
    const params = searchParams.get("search");
    const contentQuery = searchParams.get("contentSearch");

    const isContentSearch = !!contentQuery;

    useEffect(() => {
        if (contentQuery) {
            searchContent(contentQuery).then(setContentResults).catch(console.error);
            setBooks([]);
        } else if (params) {
            searchBook(params).then(async (loadedBooks) => {
                setBooks(loadedBooks);
                console.log(loadedBooks)
            }).catch(console.error);
            setContentResults([]);
        } else {
            setContentResults([]);
            getPublicBooks().then(async (loadedBooks) => {
                setBooks(loadedBooks);
            }).catch(console.error);
        }
    }, [params, contentQuery]);

    const handleBookClick = (book) => {
        setSelectedBook(book);
        if (getRole() === "ROLE_ADMIN") {
            setAdminIsModalOpen(true);
        } else {
            setIsUserModalOpen(true);
        }
    };

    const handleContentResultClick = (result) => {
        const emMatch = (result.textSnippet || "").match(/<em>(.*?)<\/em>/);
        const highlightText = emMatch ? emMatch[1] : null;
        const spineIdx = result.spineIndex != null && result.spineIndex >= 0 ? result.spineIndex : result.chapterIndex;
        navigate(`/reader`, { state: { id: result.bookId, title: result.title, searchChapterIndex: spineIdx, searchParagraphIndex: result.paragraphIndex, searchHighlightText: highlightText } });
    };

    return (
        <div className="books-wrapper">

            <div className="top-bar">
                <button className="back-btn" onClick={() => navigate("/")}> ↩ </button>
                <h1>Cупер мега крутая онлайн библиотека класс вау 💯</h1>
                <SearchField/>
            </div>

            <div className="content-area ">
                <div className="books-grid">
                    {isContentSearch ? (
                        contentResults.length === 0 ? (
                            <p className="empty-result">По цитате "{query}" ничего не найдено</p>
                        ) : (
                            contentResults.map((r, idx) => (
                                <ContentSearchResultCard
                                    key={idx}
                                    result={r}
                                    onBookClick={handleContentResultClick}
                                />
                            ))
                        )
                    ) : (
                        books.length === 0 ? (
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
                        )
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

import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import "./admin-modal-window.css";

import {
    addBookToBookSet,
    createBookSet,
    deleteBookSet,
    getAllBookSets,
    getBooksInBookSet,
    removeBookFromBookSet,
    updateBookSet
} from "../api/adminGroupApi";

import { getAllPrivateBooks } from "../api/adminBookApi";

export default function AdminBookSetsModal({ isOpen, onClose }) {
    const [bookSets, setBookSets] = useState([]);
    const [allBooks, setAllBooks] = useState([]);

    const [selectedBookSet, setSelectedBookSet] = useState(null);
    const [booksInSelectedSet, setBooksInSelectedSet] = useState([]);

    const [form, setForm] = useState({
        name: "",
        description: ""
    });

    const [selectedBookOption, setSelectedBookOption] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        loadInitialData();
    }, [isOpen]);

    useEffect(() => {
        if (!selectedBookSet) {
            setForm({
                name: "",
                description: ""
            });
            setBooksInSelectedSet([]);
            setSelectedBookOption(null);
            return;
        }

        setForm({
            name: selectedBookSet.name || "",
            description: selectedBookSet.description || ""
        });

        loadBooksForBookSet(selectedBookSet.id);
    }, [selectedBookSet]);

    async function runSafely(callback) {
        setError("");

        try {
            return await callback();
        } catch (e) {
            console.error(e);
            setError(e.message || "Что-то пошло не так");
        }
    }

    async function loadInitialData() {
        await runSafely(async () => {
            const [bookSetsData, booksData] = await Promise.all([
                getAllBookSets(),
                getAllPrivateBooks()
            ]);

            setBookSets(bookSetsData || []);
            setAllBooks(booksData || []);
        });
    }

    async function loadBooksForBookSet(bookSetId) {
        await runSafely(async () => {
            const data = await getBooksInBookSet(bookSetId);
            setBooksInSelectedSet(data || []);
        });
    }

    function getBookFromBookSetItem(item) {
        return item.book || item;
    }

    const availableBookOptions = useMemo(() => {
        const usedBookIds = new Set(
            booksInSelectedSet.map(item => {
                const book = getBookFromBookSetItem(item);
                return book.id;
            })
        );

        return allBooks
            .filter(book => !usedBookIds.has(book.id))
            .map(book => ({
                value: book.id,
                label: `${book.title || "Без названия"}${book.author ? ` — ${book.author}` : ""}`
            }));
    }, [allBooks, booksInSelectedSet]);

    async function handleSubmit(e) {
        e.preventDefault();

        await runSafely(async () => {
            if (selectedBookSet) {
                await updateBookSet(selectedBookSet.id, form);
            } else {
                await createBookSet(form);
            }

            setSelectedBookSet(null);
            setForm({
                name: "",
                description: ""
            });

            await loadInitialData();
        });
    }

    async function handleDeleteBookSet(bookSetId) {
        if (!window.confirm("Удалить book-set?")) return;

        await runSafely(async () => {
            await deleteBookSet(bookSetId);

            if (selectedBookSet?.id === bookSetId) {
                setSelectedBookSet(null);
            }

            await loadInitialData();
        });
    }

    async function handleAddBookToSet() {
        if (!selectedBookSet || !selectedBookOption) return;

        await runSafely(async () => {
            await addBookToBookSet(selectedBookSet.id, selectedBookOption.value);

            setSelectedBookOption(null);
            await loadBooksForBookSet(selectedBookSet.id);
        });
    }

    async function handleRemoveBookFromSet(bookId) {
        if (!selectedBookSet) return;

        await runSafely(async () => {
            await removeBookFromBookSet(selectedBookSet.id, bookId);
            await loadBooksForBookSet(selectedBookSet.id);
        });
    }

    function startCreateMode() {
        setSelectedBookSet(null);
        setForm({
            name: "",
            description: ""
        });
        setBooksInSelectedSet([]);
        setSelectedBookOption(null);
    }

    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-window" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Book Sets</h2>
                    <button className="close-btn" onClick={onClose}>
                        X
                    </button>
                </div>

                {error && <div className="page-error">{error}</div>}

                <div className="users-layout">
                    <table className="users-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>
                                <button className="add-btn" onClick={startCreateMode}>
                                    Create
                                </button>
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {bookSets.length === 0 ? (
                            <tr>
                                <td colSpan="3">Book-sets пока нет</td>
                            </tr>
                        ) : (
                            bookSets.map(bookSet => (
                                <tr key={bookSet.id}>
                                    <td>{bookSet.name}</td>
                                    <td>{bookSet.description || "-"}</td>
                                    <td>
                                        <button
                                            className="action-btn"
                                            onClick={() => setSelectedBookSet(bookSet)}
                                        >
                                            Open
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteBookSet(bookSet.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <h3>{selectedBookSet ? "Edit book-set" : "Create book-set"}</h3>

                    <input
                        name="name"
                        placeholder="Название book-set"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                    />

                    <input
                        name="description"
                        placeholder="Описание"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />

                    <div className="modal-buttons">
                        <button type="submit" className="save-btn">
                            Save
                        </button>

                        {selectedBookSet && (
                            <button
                                type="button"
                                className="action-btn"
                                onClick={startCreateMode}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {selectedBookSet && (
                    <div className="users-layout">
                        <h3>Books in: {selectedBookSet.name}</h3>

                        <div className="modal-form">
                            <Select
                                options={availableBookOptions}
                                value={selectedBookOption}
                                onChange={setSelectedBookOption}
                                placeholder="Выберите книгу"
                                isSearchable
                            />

                            <button
                                type="button"
                                className="add-btn"
                                onClick={handleAddBookToSet}
                                disabled={!selectedBookOption}
                            >
                                Add book
                            </button>
                        </div>

                        <table className="users-table">
                            <thead>
                            <tr>
                                <th>Book</th>
                                <th>Author</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {booksInSelectedSet.length === 0 ? (
                                <tr>
                                    <td colSpan="3">Книг пока нет</td>
                                </tr>
                            ) : (
                                booksInSelectedSet.map(item => {
                                    const book = getBookFromBookSetItem(item);

                                    return (
                                        <tr key={book.id}>
                                            <td>{book.title || "-"}</td>
                                            <td>{book.author || "-"}</td>
                                            <td>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleRemoveBookFromSet(book.id)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
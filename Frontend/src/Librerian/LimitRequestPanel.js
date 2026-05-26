import React, { useState } from "react";

export default function LimitRequestsPanel({
                                               bookLimitRequests,
                                               categoryLimitRequests,
                                               onCreateBookLimitRequest,
                                               onCreateCategoryLimitRequest,
                                               selectedGroupId,
                                               isLoading
                                           }) {
    const [bookForm, setBookForm] = useState({ bookID: "", requestedLimit: "" });
    const [categoryForm, setCategoryForm] = useState({ categoryID: "", requestedLimit: "" });

    const submitBook = async (e) => {
        e.preventDefault();
        await onCreateBookLimitRequest({
            groupID: selectedGroupId,
            bookID: bookForm.bookID.trim(),
            requestedLimit: Number(bookForm.requestedLimit)
        });
        setBookForm({ bookID: "", requestedLimit: "" });
    };

    const submitCategory = async (e) => {
        e.preventDefault();
        await onCreateCategoryLimitRequest({
            groupID: selectedGroupId,
            categoryID: categoryForm.categoryID.trim(),
            requestedLimit: Number(categoryForm.requestedLimit)
        });
        setCategoryForm({ categoryID: "", requestedLimit: "" });
    };

    return (
        <section className="limits-layout">
            <form className="limit-form" onSubmit={submitBook}>
                <h3>Запрос лимита на книгу</h3>
                <input
                    value={bookForm.bookID}
                    onChange={(e) => setBookForm({ ...bookForm, bookID: e.target.value })}
                    placeholder="Book UUID"
                    required
                />
                <input
                    type="number"
                    min="1"
                    value={bookForm.requestedLimit}
                    onChange={(e) => setBookForm({ ...bookForm, requestedLimit: e.target.value })}
                    placeholder="Новый лимит"
                    required
                />
                <button className="primary-btn" disabled={isLoading}>Отправить</button>
            </form>

            <form className="limit-form" onSubmit={submitCategory}>
                <h3>Запрос лимита на категорию</h3>
                <input
                    value={categoryForm.categoryID}
                    onChange={(e) => setCategoryForm({ ...categoryForm, categoryID: e.target.value })}
                    placeholder="Category UUID"
                    required
                />
                <input
                    type="number"
                    min="1"
                    value={categoryForm.requestedLimit}
                    onChange={(e) => setCategoryForm({ ...categoryForm, requestedLimit: e.target.value })}
                    placeholder="Новый лимит"
                    required
                />
                <button className="primary-btn" disabled={isLoading}>Отправить</button>
            </form>

            <div className="requests-table-card">
                <h3>Мои запросы лимитов на книги</h3>
                <RequestsTable items={bookLimitRequests} entityKey="book" />
            </div>

            <div className="requests-table-card">
                <h3>Мои запросы лимитов на категории</h3>
                <RequestsTable items={categoryLimitRequests} entityKey="category" />
            </div>
        </section>
    );
}

function RequestsTable({ items, entityKey }) {
    if (!items?.length) return <div className="state-message compact">Пока пусто</div>;

    return (
        <table className="users-table">
            <thead>
            <tr>
                <th>Объект</th>
                <th>Лимит</th>
                <th>Статус</th>
            </tr>
            </thead>
            <tbody>
            {items.map((item) => (
                <tr key={item.id}>
                    <td>{item?.[entityKey]?.title || item?.[entityKey]?.name || item?.[`${entityKey}ID`] || "—"}</td>
                    <td>{item.requestedLimit || item.limit || "—"}</td>
                    <td>{item.status || "NEW"}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

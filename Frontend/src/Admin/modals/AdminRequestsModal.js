import React, { useEffect, useState } from "react";
import "./admin-modal-window.css";
import {
    getAllLimitRequests,
    approveLimitRequest,
    rejectLimitRequest,
    getAllCategoryLimitRequests,
    approveCategoryLimitRequest,
    rejectCategoryLimitRequest
} from "../api/adminGroupApi";

export default function AdminRequestsModal({ isOpen, onClose }) {
    const [mode, setMode] = useState("book");
    const [bookRequests, setBookRequests] = useState([]);
    const [categoryRequests, setCategoryRequests] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadRequests();
        }
    }, [isOpen]);

    const loadRequests = async () => {
        try {
            const bookData = await getAllLimitRequests();
            const categoryData = await getAllCategoryLimitRequests();

            setBookRequests(bookData);
            setCategoryRequests(categoryData);
        } catch (e) {
            console.error(e);
        }
    };

    const handleApproveBook = async (id) => {
        await approveLimitRequest(id);
        loadRequests();
    };

    const handleRejectBook = async (id) => {
        await rejectLimitRequest(id);
        loadRequests();
    };

    const handleApproveCategory = async (id) => {
        await approveCategoryLimitRequest(id);
        loadRequests();
    };

    const handleRejectCategory = async (id) => {
        await rejectCategoryLimitRequest(id);
        loadRequests();
    };

    if (!isOpen) return null;

    const requests = mode === "book" ? bookRequests : categoryRequests;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-window" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="admin-tabs">
                        <button
                            className={mode === "book" ? "tab active" : "tab"}
                            onClick={() => setMode("book")}
                        >
                            Запросы на книги
                        </button>

                        <button
                            className={mode === "category" ? "tab active" : "tab"}
                            onClick={() => setMode("category")}
                        >
                            Запросы на категории
                        </button>
                    </div>
                    <button className="close-btn" onClick={onClose}> X </button>
                </div>

                <table className="users-table">
                    <thead>
                    <tr>
                        <th>Group</th>
                        <th>{mode === "book" ? "Book" : "Category"}</th>
                        <th>Requested limit</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {requests.length === 0 ? (
                        <tr>
                            <td colSpan="5">Запросов нет</td>
                        </tr>
                    ) : (
                        requests.map(request => (
                            <tr key={request.id}>
                                <td>{request.group?.name || request.groupName || "-"}</td>
                                <td>
                                    {mode === "book"
                                        ? request.book?.title || request.bookTitle || request.bookID || "-"
                                        : request.category?.genreName || request.category?.name || request.categoryID || "-"}
                                </td>
                                <td>{request.requestedLimit || request.limit || "-"}</td>
                                <td>{request.status || "-"}</td>
                                <td>
                                    <button
                                        className="save-btn"
                                        onClick={() => mode === "book"
                                            ? handleApproveBook(request.id)
                                            : handleApproveCategory(request.id)}
                                    >
                                        ✓
                                    </button>

                                    <button
                                        className="action-btn"
                                        onClick={() => mode === "book"
                                            ? handleRejectBook(request.id)
                                            : handleRejectCategory(request.id)}
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import Select from "react-select";
import "./modal-window.css";
import {
    createBookAccessRequest,
    getMyBookAccessRequests,
    getUserGroups
} from "../Book/api/accessRequestApi";

export default function BookAccessRequestModal({ isOpen, onClose, book, bookId }) {
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setMessage("");
        setSelectedGroupId("");

        getUserGroups()
            .then(data => setGroups(data || []))
            .catch(console.error);

        console.log()

        getMyBookAccessRequests()
            .then(data => setRequests(data || []))
            .catch(console.error);
    }, [isOpen]);

    if (!isOpen || !book) return null;

    const groupOptions = groups.map(group => ({
        value: group.id,
        label: group.name
    }));

    const hasRequestForBook = requests.some(request => {
        const requestBookId = request.book?.id || request.bookID || request.bookId;
        return String(requestBookId) === String(bookId);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedGroupId) {
            setMessage("Выберите группу");
            return;
        }

        setLoading(true);

        try {
            await createBookAccessRequest(bookId, selectedGroupId);
            setMessage("Запрос отправлен библиотекарю");
        } catch (e) {
            console.error(e);
            setMessage("Не получилось отправить запрос");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Нет доступа к книге</h2>
                    <button className="close-btn" onClick={onClose}>X</button>
                </div>

                <div className="modal-content">
                    <p><b>Книга:</b> {book.title}</p>
                    <p><b>Автор:</b> {book.author}</p>
                    <p>
                        Книга приватная. Выберите группу, от которой хотите отправить запрос библиотекарю.
                    </p>

                    {hasRequestForBook && (
                        <p className="request-note">
                            У вас уже есть запрос на эту книгу. Можно отправить ещё один от другой группы.
                        </p>
                    )}
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <Select
                        options={groupOptions}
                        placeholder="Выберите группу"
                        classNamePrefix="rs"
                        isSearchable={false}
                        onChange={(option) =>
                            setSelectedGroupId(option?.value || "")
                        }
                    />

                    {message && (
                        <div className="request-message">
                            {message}
                        </div>
                    )}

                    <div className="modal-buttons">
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={loading || groups.length === 0}
                        >
                            {loading ? "Отправляем..." : "Отправить запрос"}
                        </button>

                        <button
                            type="button"
                            className="action-btn"
                            onClick={onClose}
                        >
                            Назад
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

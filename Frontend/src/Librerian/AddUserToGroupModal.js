import React, { useState } from "react";
import Select from "react-select";

export default function AddUserToGroupModal({ isOpen, groupName, onClose, onSubmit, isLoading, users }) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const userOptions = users.map(user => ({
        value: user.email,
        label: user.email
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Введите email пользователя");
            return;
        }

        await onSubmit(trimmedEmail);
        setEmail("");
        setError("");
    };

    return (
        <div className="lib-modal-backdrop" onMouseDown={onClose}>
            <form className="lib-modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="lib-modal-header">
                    <div>
                        <h3>Добавить пользователя</h3>
                        <p>Группа: {groupName}</p>
                    </div>
                    <button type="button" className="icon-btn" onClick={onClose}>×</button>
                </div>

                <label className="form-field">
                    <span>Email пользователя</span>

                    <Select
                        options={userOptions}
                        value={email}
                        placeholder="Выберите email пользователя"
                        onChange={(e) => setEmail(e.target.value)}
                        classNamePrefix="rs"
                        isSearchable={true}
                    />
                </label>

                {error && <div className="inline-error">{error}</div>}

                <div className="lib-modal-actions">
                    <button type="button" className="secondary-btn" onClick={onClose}>Отмена</button>
                    <button type="submit" className="primary-btn" disabled={isLoading}>
                        {isLoading ? "Добавляем..." : "Добавить"}
                    </button>
                </div>
            </form>
        </div>
    );
}

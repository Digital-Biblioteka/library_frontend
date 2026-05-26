import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { getBookLimits, giveBookLimits, updateBookLimits } from "../api/adminGroupApi";
import Select from "react-select";

export default function AdminGroupLimitsModal({ isOpen, group, onClose, books }) {
    const [limits, setLimits] = useState([]);
    const [selectedLimit, setSelectedLimit] = useState(null);

    useEffect(() => {
        if (isOpen && group) {
            loadLimits();
        }
    }, [isOpen, group]);

    const loadLimits = async () => {
        try {
            const data = await getBookLimits(group.id);
            setLimits(data);
        } catch (e) {
            console.error(e);
        }
    };

    const bookOptions = books.map(book => ({
        value: book.id,
        label: `${book.title} — ${book.author}`
    }));

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            bookID: selectedLimit?.book?.id || selectedLimit?.bookID || "",
            limit: selectedLimit?.limit || ""
        },
        onSubmit: async (values, { resetForm }) => {
            try {
                if (selectedLimit) {
                    await updateBookLimits(selectedLimit.id, {
                        limit: values.limit
                    });
                } else {
                    await giveBookLimits(group.id, {
                        bookID: values.bookID,
                        limit: values.limit
                    });
                }

                resetForm();
                setSelectedLimit(null);
                loadLimits();
            } catch (e) {
                console.error(e);
            }
        }
    });

    if (!isOpen || !group) return null;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-window" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Лимиты группы {group.name}</h2>
                    <button className="close-btn" onClick={onClose}> X </button>
                </div>

                <div className="users-layout">
                    <table className="users-table">
                        <thead>
                        <tr>
                            <th>Book</th>
                            <th>Limit</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {limits.length === 0 ? (
                            <tr>
                                <td colSpan="3">Лимитов пока нет</td>
                            </tr>
                        ) : (
                            limits.map(limit => (
                                <tr key={limit.id}>
                                    <td>{limit.book?.title || limit.bookID || "-"}</td>
                                    <td>{limit.limit}</td>
                                    <td>
                                        <button
                                            className="action-btn"
                                            onClick={() => setSelectedLimit(limit)}
                                        >
                                            ✎
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <form className="modal-form" onSubmit={formik.handleSubmit}>
                    {!selectedLimit && (
                        <Select
                            options={bookOptions}
                            placeholder="Выберите книгу"
                            onChange={(option) =>
                                formik.setFieldValue("bookID", option?.value || "")
                            }
                            classNamePrefix="rs"
                            isSearchable={true}
                        />
                    )}

                    <input
                        type="number"
                        name="limit"
                        placeholder="Лимит"
                        value={formik.values.limit}
                        onChange={formik.handleChange}
                    />

                    <div className="modal-buttons">
                        <button type="submit" className="save-btn">
                            {selectedLimit ? "Сохранить" : "Добавить лимит"}
                        </button>

                        {selectedLimit && (
                            <button
                                type="button"
                                className="action-btn"
                                onClick={() => setSelectedLimit(null)}
                            >
                                Отмена
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

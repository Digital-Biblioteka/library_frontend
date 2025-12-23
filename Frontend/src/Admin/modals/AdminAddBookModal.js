import React, { useState, useRef } from "react";
import "../../User(Home pages)/modal-window.css";
import {useFormik} from "formik";
import {addBook} from "../api/adminBookApi";
import {useNavigate} from "react-router-dom";
import SearchField from "../../Book/SearchField";
import BookForm from "../form/BookForm";

const validate = (values, mode) => {
    const errors = {};

    if (mode) {
        if (!values.title) errors.title = "Book title cannot be empty";
        if (!values.author) errors.email = "Author's name cannot be empty";
        if (!values.description) errors.password = "Please, add some book description";
        if (!values.genre) errors.genre = "Choose the genre of book";
        if (!values.publisher) errors.publisher = "Add the publisher";
    }

    if (!values.file) errors.file = "Please, don't forget to add .epub"

    return errors;
};

export default function WorkWIthBookModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [mode, setMode] = useState("main");
    const [manualMode, setManualMode] = useState(false);

    const formik = useFormik({
        initialValues: {
            title: "",
            author: "",
            description: "",
            genre: "",
            publisher: "",
            file: null,
        },

        validate: (values) => validate(values, manualMode),
        onSubmit: async (values, { resetForm }) => {
            try {
                const dto = {
                    mode: manualMode ? "manual" : "auto",
                    bookDTO: manualMode
                        ? {
                            title: values.title,
                            author: values.author,
                            description: values.description,
                            genreId: values.genre,
                            publisher: values.publisher,
                        }
                        : null,
                };

                const formData = new FormData();
                formData.append("file", values.file);
                formData.append("addBookDTO", JSON.stringify(dto))

                await addBook(formData);

                resetForm();
                setMode("main");
                setManualMode(false);

                fileInputRef.current.value = "";
                onClose?.();
            } catch (err) {
                alert(err.message);
                console.log(err.message)
            }
        },
    });

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) formik.setFieldValue("file", f);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-window"
                onClick={(e) => e.stopPropagation()}>
                {mode === "main" && (
                    <>
                        <div className="modal-header">
                            <h2>Управление книгами</h2>
                            <button className="close-btn" onClick={onClose}> X </button>
                        </div>
                        <div className="modal-content">
                            <SearchField />
                            <div className="modal-buttons">
                                <button className="action-btn"
                                    onClick={() => navigate("/book-list")}>
                                    Показать все книги
                                </button>
                                <button className="add-btn"
                                    onClick={() => setMode("add")}>
                                    Добавить книгу
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {mode === "add" && (
                    <>
                        <h2>Добавить новую книгу</h2>

                        <form className="modal-form" onSubmit={formik.handleSubmit}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".epub"
                                onChange={handleFileChange}
                            />
                            {formik.errors.file && <div className="error">{formik.errors.file}</div>}

                            {!manualMode && (
                                <button
                                    type="button"
                                    onClick={() => setManualMode(true)}>
                                    Ввести данные книжки вручную
                                </button>
                            )}

                            {manualMode && (
                                <BookForm formik={formik}/>
                            )}

                            <div className="modal-buttons">
                                <button type="submit" className="save-btn">
                                    Сохранить
                                </button>
                                <button type="button" className="cancel-btn"
                                    onClick={() => setMode("main")}>
                                    Назад
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
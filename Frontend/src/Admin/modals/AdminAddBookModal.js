import React, { useState, useRef, useEffect } from "react";
import "../../User(Home pages)/modal-window.css";
import {useFormik} from "formik";
import {addBook, getIndexingStatus} from "../api/adminBookApi";
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
    const [isPrivate, setIsPrivate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [indexingStatus, setIndexingStatus] = useState(null);
    const [lastAddedBookId, setLastAddedBookId] = useState(null);


    const handlePrivateCheckbox = (e) => {
        setIsPrivate(e.target.checked? "PRIVATE": "PUBLIC");
    };

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
            setIsLoading(true);
            try {
                console.log("[addBook] onSubmit fired, values:", values);
                const dto = {
                    mode: manualMode ? "manual" : "auto",
                    bookDTO: manualMode ? {
                            title: values.title,
                            author: values.author,
                            description: values.description,
                            genre: values.genre,
                            publisher: values.publisher,
                        }
                        : null,
                    publicityType: isPrivate,
                };

                const formData = new FormData();
                formData.append("file", values.file);
                formData.append("addBookDTO", JSON.stringify(dto))
                console.log("[addBook] FormData ready, dto:", dto, "file:", values.file?.name);

                const createdBook = await addBook(formData);
                console.log("[addBook] upload success");

                resetForm();
                setMode("main");
                setManualMode(false);

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                setLastAddedBookId(createdBook.id);
                setIndexingStatus(createdBook.indexingStatus || "NOT_INDEXED");
                setMode("indexing");
            } catch (err) {
                console.error("[addBook] upload FAILED:", err);
                alert(err.message);
            }  finally {
                setIsLoading(false);
            }
        },
    });

    useEffect(() => {
        if (mode !== "indexing" || !lastAddedBookId) return;

        const poll = setInterval(async () => {
            try {
                const status = await getIndexingStatus(lastAddedBookId);
                console.log("[addBook] indexing status:", status);
                setIndexingStatus(status);
                if (status !== "INDEXING") {
                    clearInterval(poll);
                }
            } catch (err) {
                console.error("[addBook] polling status failed:", err);
                clearInterval(poll);
            }
        }, 3000);

        return () => clearInterval(poll);
    }, [mode, lastAddedBookId]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) formik.setFieldValue("file", f);
    };

    return (
        <div className="modal-overlay">
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
                                    onClick={() => {setMode("add"); setManualMode(false)}}>
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
                                    className="action-btn"
                                    type="button"
                                    onClick={() => setManualMode(true)}>
                                    Ввести данные книжки вручную
                                </button>
                            )}

                            {manualMode && (
                                <BookForm formik={formik}/>
                            )}

                            <div className="check-form">
                                <input type="checkbox" onChange={handlePrivateCheckbox}/>
                                <label>Private</label>
                            </div>

                            <div className="modal-buttons">
                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Загрузка..." : "Сохранить"}
                                </button>
                                <button type="button" className="action-btn"
                                        onClick={() => {
                                            setMode("main");
                                            setManualMode(false)
                                        }}>
                                    Назад
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {mode === "indexing" && (
                    <>
                        <div className="modal-header">
                            <h2>Добавление книги</h2>
                            <button className="close-btn" onClick={handleIndexingClose}> X </button>
                        </div>
                        <div className="modal-content">
                            <div className="indexing-progress">
                                <p>Книга загружена. Статус индексации:</p>
                                <div className="indexing-status">
                                    <strong>{indexingStatus || "—"}</strong>
                                    {indexingStatus === "INDEXING" && <span className="spinner" />}
                                    {indexingStatus === "INDEXED" && <span className="status-ok" />}
                                    {indexingStatus === "FAILED" && <span className="status-fail" />}
                                </div>
                                {indexingStatus === "INDEXING" && (
                                    <p style={{ color: "#888", fontSize: "13px" }}>
                                        Индексация выполняется в фоне. Вы можете закрыть это окно и продолжить работу - книга будет проиндексирована автоматически.
                                    </p>
                                )}
                                {indexingStatus === "INDEXED" && (
                                    <p style={{ color: "green" }}>Книга успешно проиндексирована!</p>
                                )}
                                {indexingStatus === "FAILED" && (
                                    <p style={{ color: "red" }}>Ошибка индексации. Попробуйте переиндексировать в карточке книги.</p>
                                )}
                                <div className="modal-buttons" style={{ marginTop: "20px" }}>
                                    <button className="save-btn" onClick={handleIndexingClose}>
                                        {indexingStatus === "INDEXING"
                                            ? "можно закрывать, книжка загружается в библиотеку"
                                            : "закрыть"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
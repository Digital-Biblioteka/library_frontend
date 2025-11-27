import React, {useState, useRef} from "react";
import "../../../style/modal-window.css";
import {useFormik} from "formik";
import Select from "react-select"
import {addBook} from "../../../api/adminBookApi";
import {useNavigate} from "react-router-dom";
import {genres} from "./Genres";

const validate = (values, mode) => {
    const errors = {};

    if (mode) {
        if (!values.title) errors.title = "Book title cannot be empty";

        if (!values.author) errors.email = "Author's name cannot be empty";

        if (!values.description) errors.password = "Please, add some book description";

        if (!values.genre) errors.genre = "Choose the genre of book";

        if (!values.publisher) errors.publisher = "Add the publisher";

        if (!values.isbn) errors.isbn = "Add the ISBN"
    }

    if (!values.file) errors.file = "Please, don't forget to add .epub"

    return errors;
};

export default function WorkWIthBookModal({ isOpen, onClose }) {
    const fileInputRef = useRef(null);
    const [mode, setMode] = useState("main"); // "main" | "add"
    const [manualMode, setManualMode] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const navigate = useNavigate();

    // Formik форма для добавления книги
    const formik = useFormik({
        initialValues: {
            title: "",
            author: "",
            description: "",
            genre: "",
            publisher: "",
            isbn: "",
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
                            genre: values.genre,
                            publisher: values.publisher,
                            isbn: values.isbn,
                        }
                        : null,
                };

                const formData = new FormData();
                if (!values.file) throw new Error("Файл добавь блять!!!");
                formData.append("file", values.file);
                formData.append("addBookDTO", JSON.stringify(dto))

                await addBook(formData);

                alert("Книга успешно добавлена!");
                resetForm();
                setMode("main");
                setManualMode(false);

                if (fileInputRef.current) fileInputRef.current.value = "";
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

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleShowAllBooks = () => {
        navigate("/book-list");
    }


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-window"
                onClick={(e) => e.stopPropagation()}
            >
                {mode === "main" && (
                    <>
                        <div className="modal-header">
                            <h2>Управление книгами</h2>
                            <button className="close-btn" onClick={onClose}> X </button>
                        </div>
                        <div className="modal-content">
                            <div className="search">
                                <input
                                    placeholder="поиск книги"
                                    className="search-field"
                                    onChange={handleSearchChange}
                                />
                                <button
                                    className="search-btn">
                                    Поиск
                                </button>
                            </div>

                            <div className="modal-buttons">
                                <button
                                    className="action-btn"
                                    onClick={handleShowAllBooks}
                                >
                                    Показать все книги
                                </button>
                                <button
                                    className="add-btn"
                                    onClick={() => setMode("add")}
                                >
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
                                <>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Название книги"
                                        value={formik.values.title}
                                        onChange={formik.handleChange}
                                    />
                                    {formik.errors.title && <div className="error">{formik.errors.title}</div>}

                                    <input
                                        type="text"
                                        name="author"
                                        placeholder="Автор"
                                        value={formik.values.author}
                                        onChange={formik.handleChange}
                                    />
                                    {formik.errors.author
                                        && <div className="error">{formik.errors.author}</div>}

                                    <textarea
                                        name="description"
                                        placeholder="Описание"
                                        rows="3"
                                        value={formik.values.description}
                                        onChange={formik.handleChange}
                                    />
                                    {formik.errors.description
                                        && <div className="error">{formik.errors.description}</div>}

                                    <Select
                                        options={genres}
                                        placeholder="Выберите жанр..."
                                        value={genres.find((g) => g.value === formik.values.genre)}
                                        onChange={(option) => formik.setFieldValue("genre", option.value)}
                                        classNamePrefix="rs"
                                    />

                                    {formik.errors.genre && <div className="error">{formik.errors.genre}</div>}

                                    <input
                                        type="text"
                                        name="publisher"
                                        placeholder="Издательство"
                                        value={formik.values.publisher}
                                        onChange={formik.handleChange}
                                    />
                                    {formik.errors.publisher
                                        && <div className="error">{formik.errors.publisher}</div>}

                                    <input
                                        type="text"
                                        name="isbn"
                                        placeholder="ISBN"
                                        value={formik.values.isbn}
                                        onChange={formik.handleChange}
                                    />
                                    {formik.errors.isbn
                                        && <div className="error">{formik.errors.isbn}</div>}
                                </>
                            )}

                            <div className="modal-buttons">
                                <button type="submit" className="save-btn">
                                    Сохранить
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setMode("main")}
                                >
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
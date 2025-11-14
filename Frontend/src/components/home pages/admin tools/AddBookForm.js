import React, { useState } from "react";
import "../../../style/add-book.css";
import {useFormik} from "formik";
import Select from "react-select"
import {addBook} from "../../../api/addBookApi";

const validate = (values) => {
    const errors = {};

    if (!values.title) errors.title = "Book title cannot be empty";

    if (!values.author) errors.email = "Author's name cannot be empty";

    if (!values.description) errors.password = "Please, add some book description";

    if (!values.genre) errors.genre = "Choose the genre of book";

    if (!values.publisher) errors.publisher = "Add the publisher";

    if (!values.file) errors.file = "Please, don't forget to add .epub"

    return errors;
};

const genres = [
    { value: "fantasy", label: "Фэнтези" },
    { value: "sci-fi", label: "Фантастика" },
    { value: "detective", label: "Детектив" },
    { value: "romance", label: "Роман" },
    { value: "adventure", label: "Приключения" },
    { value: "science", label: "Научная литература" },
];

export default function AddBookModal({ isOpen, onClose }) {
    const [mode, setMode] = useState("main"); // "main" | "add"
    const [searchValue, setSearchValue] = useState('');

    // Formik форма для добавления книги
    const formik = useFormik({
        initialValues: {
            title: "",
            author: "",
            description: "",
            genre: "",
            publisher: "",
            file: "", //тут пока не сам файл а ссылка
        },

        validate: (values) => validate(values, mode),
        onSubmit: async (values) => {
            try {
                console.log("📘 Отправка книги:", values);
                let resp;

                resp = await addBook({
                    mode: "manual",
                    link: values.file,
                    bookDTO: {
                        title: values.title,
                        author: values.author,
                        description: values.description,
                        genre: values.genre,
                        publisher: values.publisher,
                        isbn: "1",
                        linkToBook: values.file
                    }
                });

                console.log(resp);

                alert("Книга успешно добавлена!");
                setMode("main");
            } catch (err) {
                alert(err.message);
                console.log(err.message)
            }
        },
    });

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        formik.setFieldValue("file", URL.createObjectURL(e.target.files[0]));
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-window"
                onClick={(e) => e.stopPropagation()}
            >
                {mode === "main" && (
                    <>
                        <h2>Управление книгами</h2>
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
                                <button className="action-btn">Показать все книги</button>
                                <button
                                    className="add-btn"
                                    onClick={() => setMode("add")}
                                >
                                    Добавить книгу
                                </button>
                            </div>
                        </div>

                        <button className="close-btn" onClick={onClose}>
                            Закрыть
                        </button>
                    </>
                )}

                {mode === "add" && (
                    <>
                        <h2>Добавить новую книгу</h2>
                        <form className="modal-form" onSubmit={formik.handleSubmit}>
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
                                type="file"
                                accept=".epub"
                                onChange={handleFileChange}
                            />
                            {formik.errors.file && <div className="error">{formik.errors.file}</div>}

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
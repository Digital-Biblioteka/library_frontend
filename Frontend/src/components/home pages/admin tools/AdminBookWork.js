import "../../../style/modal-window.css"
import {useNavigate} from "react-router-dom";
import {deleteBook, editBook} from "../../../api/adminBookApi";
import React, {useState} from "react";
import {useFormik} from "formik";
import Select from "react-select";
import {genres} from "./Genres";
import {openBook} from "../../../api/readerApi";


export default function AdminEditorModal({ isOpen, onClose, book }) {
    const navigate = useNavigate();
    const [mode, setMode] = useState("main");

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: book?.title,
            author: book?.author,
            description: book?.description,
            genre: book?.genre,
            publisher: book?.publisher
        },

        onSubmit: async (values, { resetForm }) => {
            try {
                await editBook( book.id, {
                    title: values.title,
                    author: values.author,
                    description: values.description,
                    genre: values.genre,
                    publisher: values.publisher,
                    isbn: book.isbn
                });
                alert("Книга успешно обновлена!");
                resetForm();
                setMode("main");

                onClose?.();
                window.location.reload();
            } catch (err) {
                alert(err.message);
                console.log(err.message)
            }
        },
    });

    const handleDeleteBook = () => {
        deleteBook(book.id)
            .then(() => {
                onClose();
                window.location.reload();
            })
            .catch(err => console.error("Ошибка удаления книги:", err))
    }

    const handleOpenBook = async () => {
        let bookToOpen = await openBook(book.id)
        console.log(bookToOpen)

        navigate("/reader", {state: {url: bookToOpen}})
    }

    if (!isOpen || !book) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-window"
                 onClick={(e) => e.stopPropagation()}
            >
                {mode === "main" && (
                    <>
                        <h2>Редактировать книгу</h2>
                        <button className="close-btn" onClick={onClose}> X </button>
                        <div className="modal-buttons">
                            <button className="add-btn" onClick={() => setMode("edit")}>
                                Редактировать
                            </button>

                            <button className="add-btn"
                                    onClick={handleOpenBook}>
                                Открыть
                            </button>

                            <button className="action-btn" onClick={handleDeleteBook}>
                                Удалить
                            </button>
                        </div>
                    </>
                )}

                {mode === "edit" && (
                    <>
                        <form className="modal-form" onSubmit={formik.handleSubmit}>
                            <input
                                type="text"
                                name="title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                            />
                            {formik.errors.title && <div className="error">{formik.errors.title}</div>}

                            <input
                                type="text"
                                name="author"
                                value={formik.values.author}
                                onChange={formik.handleChange}
                            />
                            {formik.errors.author
                                && <div className="error">{formik.errors.author}</div>}

                            <textarea
                                name="description"
                                rows="3"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                            />
                            {formik.errors.description
                                && <div className="error">{formik.errors.description}</div>}

                            <Select
                                options={genres}
                                value={genres.find((g) => g.value === formik.values.genre)}
                                onChange={(option) => formik.setFieldValue("genre", option.value)}
                                classNamePrefix="rs"
                            />
                            {formik.errors.genre && <div className="error">{formik.errors.genre}</div>}

                            <input
                                type="text"
                                name="publisher"
                                value={formik.values.publisher}
                                onChange={formik.handleChange}
                            />
                            {formik.errors.publisher
                                && <div className="error">{formik.errors.publisher}</div>}

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

import "../../User(Home pages)/modal-window.css"
import {useNavigate} from "react-router-dom";
import {deleteBook, editBook, reindexBook} from "../api/adminBookApi";
import React, {useState} from "react";
import {useFormik} from "formik";
import {openBook} from "../../Book/api/readerApi";
import BookForm from "../form/BookForm";

export default function AdminEditorModal({ isOpen, onClose, book, onBookUpdated, onBookDeleted }) {
    const navigate = useNavigate();
    const [mode, setMode] = useState("main");

    const handleReindex = async () => {
        if (!book?.id) return;
        try {
            await reindexBook(book.id);
        } catch (err) {
            console.error("Reindex failed:", err);
        }
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: book?.title,
            author: book?.author,
            description: book?.description,
            genre: book?.genre?.genreName,
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
                });

                onBookUpdated?.({
                    ...book,
                    ...values,
                });

                resetForm();
                setMode("main");
                onClose?.();

            } catch (err) {
                alert(err.message);
                console.log(err.message)
            }
        },
    });

    const handleDeleteBook = () => {
        deleteBook(book.id)
            .then(() => {
                onBookDeleted?.(book.id);
                onClose();
            })
            .catch(err => console.error("Ошибка удаления книги:", err))
    }

    const handleOpenBook = async () => {
        let bookToOpen = await openBook(book.id)
        console.log(bookToOpen)

        navigate("/reader", {state: {url: bookToOpen, title: book.title, id: book.id}})
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
                        <h2>Edit Book</h2>
                        <button className="close-btn" onClick={onClose}> X </button>

                        <div className="modal-buttons">
                            <button className="add-btn" onClick={() => setMode("edit")}>
                                Edit
                            </button>

                            <button className="add-btn"
                                    onClick={handleOpenBook}>
                                Open
                            </button>

                            <button className="delete-btn" onClick={handleDeleteBook}>
                                Delete
                            </button>
                        </div>
                    </>
                )}

                {mode === "edit" && (
                    <>
                        <form className="modal-form" onSubmit={formik.handleSubmit}>
                            <BookForm formik={formik}/>
                            <div className="modal-buttons">
                                <button type="submit" className="save-btn">
                                    Save
                                </button>
                                <button type="button" className="action-btn"
                                    onClick={() => setMode("main")}>
                                    Back
                                </button>
                            </div>
                       </form>
                    </>
                )}
            </div>
        </div>
    );
}

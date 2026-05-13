import { useFormik } from "formik";
import "./search.css";
import "../User(Home pages)/modal-window.css"
import React, {useState, useEffect} from "react";
import { Genres } from "./Genres";
import Select from "react-select";

export default function AdvancedSearchForm({ onClose, onSubmit }) {
    const [genres, setGenres] = useState([])

    useEffect(() => {
        Genres().then(setGenres);
    }, []);


    const formik = useFormik({
        initialValues: {
            title: "",
            author: "",
            genre: "",
            description: "",
            minRating: 0,
            reviewQuery: ""
        },

        onSubmit: (values) => {
            const queryObject = {
                query: null,
                title: values.title || null,
                author: values.author || null,
                genre: values.genre || null,
                description: values.description || null,
                minRating: values.minRating > 0 ? values.minRating : null,
                reviewQuery: values.reviewQuery || null
            };
            onSubmit(queryObject);
            onClose();
        }
    });

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-window"
                 onClick={(e) => e.stopPropagation()}>
                <h2>Расширенный поиск</h2>

                <form onSubmit={formik.handleSubmit} className="modal-form">

                    <input
                        type="text"
                        name="title"
                        placeholder="Название"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                    />

                    <input
                        type="text"
                        name="author"
                        placeholder="Автор"
                        value={formik.values.author}
                        onChange={formik.handleChange}
                    />

                    <textarea
                        name="description"
                        placeholder="Описание"
                        rows="3"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                    />

                    <Select
                        options={genres}
                        placeholder="Выберите жанр..."
                        value={genres.find((g) => g.value === formik.values.genre)}
                        onChange={(option) =>
                            formik.setFieldValue("genre", option?.value || "")
                        }
                        classNamePrefix="rs"
                    />

                    <div className="rating-filter-row">
                        <label>Мин. рейтинг: {formik.values.minRating}</label>
                        <input
                            type="range"
                            name="minRating"
                            min="0"
                            max="5"
                            step="0.5"
                            value={formik.values.minRating}
                            onChange={formik.handleChange}
                        />
                    </div>

                    <textarea
                        name="reviewQuery"
                        placeholder="Поиск по тексту отзывов..."
                        rows="2"
                        value={formik.values.reviewQuery}
                        onChange={formik.handleChange}
                    />

                    <div className="modal-buttons">
                        <button
                            type="button"
                            className="close-btn"
                            onClick={onClose}
                        >
                            X
                        </button>

                        <button
                            type="submit"
                            className="search-btn"
                        >
                            Искать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

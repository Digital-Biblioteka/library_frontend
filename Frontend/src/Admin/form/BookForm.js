import Select from "react-select";
import {useEffect, useState} from "react";
import {Genres, NoOptionsMessage} from "../../Book/Genres";


export default function BookForm({ formik }) {
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        Genres().then(setGenres);
    }, []);

    return (
        <>
            <input
                type="text"
                name="title"
                placeholder="Название книги"
                value={formik.values.title}
                onChange={formik.handleChange}
            />
            {formik.errors.title && (
                <div className="error">{formik.errors.title}</div>
            )}

            <input
                type="text"
                name="author"
                placeholder="Автор"
                value={formik.values.author}
                onChange={formik.handleChange}
            />
            {formik.errors.author && (
                <div className="error">{formik.errors.author}</div>
            )}

            <textarea
                name="description"
                placeholder="Описание"
                rows="3"
                value={formik.values.description}
                onChange={formik.handleChange}
            />
            {formik.errors.description && (
                <div className="error">{formik.errors.description}</div>
            )}

            <Select
                options={genres}
                placeholder="Жанр"
                value={genres.find(g => g.value === formik.values.genre)}
                onChange={(option) =>
                    formik.setFieldValue("genre", option.value)
                }
                classNamePrefix="rs"
                noOptionsMessage={({ inputValue }) => (
                    <NoOptionsMessage
                        selectProps={{ setGenres, formik }}
                        inputValue={inputValue}
                    />
                )}
            />
            {formik.errors.genre && (
                <div className="error">{formik.errors.genre}</div>
            )}

            <input
                type="text"
                name="publisher"
                placeholder="Издательство"
                value={formik.values.publisher}
                onChange={formik.handleChange}
            />
            {formik.errors.publisher && (
                <div className="error">{formik.errors.publisher}</div>
            )}
        </>
    );
}

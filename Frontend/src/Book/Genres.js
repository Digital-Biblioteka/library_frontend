import {getGenres, addGenre, editGenre, deleteGenre} from "./api/genreApi";
import Select, { components } from "react-select";
import {useEffect, useState} from "react";

export async function Genres() {
    return await getGenres();
}

export function EditGenre ({isOpen, onClose, genre, onSave, onDelete}) {
    const [value, setValue] = useState("");

    useEffect(() => {
        if (genre) setValue(genre.label);
    }, [genre]);

    if (!isOpen || !genre) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-window" onClick={e => e.stopPropagation()}>
                <h3>Редактировать жанр</h3>
                <input type="text" value={value} onChange={e => setValue(e.target.value)}/>
                <div className="modal-buttons">
                    <button className="add-btn" onClick={() => onSave(genre.value, value)}>Сохранить</button>
                    <button className="action-btn" onClick={() => onDelete(genre.value)}>Удалить</button>
                    <button className="close-btn" onClick={onClose}>X</button>
                </div>
            </div>
        </div>
    )
}

export const GenreOption = (props) => {
    const { data, selectProps } = props;

    const handleEditClick = (e) => {
        e.stopPropagation();
        selectProps.onEditGenre?.(data);
    };

    return (
        <components.Option {...props}>
            <span>{props.children}</span>
            <button
                type="button"
                onClick={handleEditClick}
                style={{
                    marginLeft: "8px",
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                }}
            >
                ✏️
            </button>
        </components.Option>
    );
};

export const NoOptionsMessage = ({ selectProps, inputValue }) => {
    const handleAddGenre = async () => {
        try {
            const created = await addGenre(inputValue);

            const newGenre = {
                value: created.id,
                label: created.genreName,
            };

            selectProps.setGenres(prev => [...prev, newGenre]);
            await selectProps.formik.setFieldValue("genre", newGenre.value);
        } catch (err) {
            console.error("Ошибка добавления жанра: " + err.message);
        }
    };

    return (
        <div className="rs__no-options">
            Нет результатов.
            <button type="button" onClick={handleAddGenre}>
                Добавить "{inputValue}"
            </button>
        </div>
    );
};

export default function GenreSelect({ formik }) {
    const [genres, setGenres] = useState([]);
    const [editingGenre, setEditingGenre] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        Genres().then(setGenres);
    }, []);

    const handleEditClick = (genre) => {
        setEditingGenre(genre);
        setIsModalOpen(true);
    };

    const handleSave = async (id, newName) => {
        try {
            await editGenre(id, newName);
            setGenres(prev =>
                prev.map(g => g.value === id ? { ...g, label: newName } : g)
            );
            if (formik.values.genre === id) await formik.setFieldValue("genre", id);
            setIsModalOpen(false);
        } catch (err) {
            alert("Ошибка редактирования жанра");
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteGenre(id);
            setGenres(prev => prev.filter(g => g.value !== id));
            if (formik.values.genre === id) await formik.setFieldValue("genreId", id);
            setIsModalOpen(false);
        } catch (err) {
            alert("Ошибка удаления жанра");
            console.error(err);
        }
    };

    return (
        <>
            <Select
                options={genres}
                placeholder="Жанр"
                value={genres.find(g => g.label === formik.values.genre)}
                onChange={option => formik.setFieldValue("genre", option.label)}
                classNamePrefix="rs"
                components={{ Option: GenreOption }}
                onEditGenre={handleEditClick}
                noOptionsMessage={({ inputValue }) => (
                    <NoOptionsMessage selectProps={{ setGenres, formik }} inputValue={inputValue} />
                )}
            />

            <EditGenre
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                genre={editingGenre}
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </>
    );
}
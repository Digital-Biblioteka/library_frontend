import {getGenres, addGenre, editGenre, deleteGenre} from "./api/genreApi";
import './genres.css'
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
        <div className="modal-overlay">
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

export default function GenreSelect({ formik }) {

    const [genres, setGenres] = useState([]);

    const [editingGenre, setEditingGenre] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        Genres().then(setGenres);
    }, []);

    const filteredGenres = genres.filter(g =>
        g.label.toLowerCase().includes(search.toLowerCase())
    );

    const handleEditClick = (genre) => {
        setEditingGenre(genre);
        setIsModalOpen(true);
    };

    const handleSave = async (id, newName) => {
        try {
            await editGenre(id, newName);

            setGenres(prev =>
                prev.map(g =>
                    g.value === id
                        ? { ...g, label: newName }
                        : g
                )
            );

            if (formik.values.genre === id) {
                await formik.setFieldValue("genre", newName);
            }

            setIsModalOpen(false);

        } catch (err) {
            console.error(err);
            alert("Ошибка редактирования жанра");
        }
    };

    const handleDelete = async (id) => {
        try {

            await deleteGenre(id);

            setGenres(prev =>
                prev.filter(g => g.value !== id)
            );

            if (formik.values.genre === id) {
                await formik.setFieldValue("genre", "");
            }

            setIsModalOpen(false);

        } catch (err) {
            console.error(err);
            alert("Ошибка удаления жанра");
        }
    };

    const handleAddGenre = async () => {

        if (!search.trim()) return;

        try {

            const created = await addGenre(search);

            const newGenre = {
                value: created.id,
                label: created.genreName,
            };

            setGenres(prev => [...prev, newGenre]);

            await formik.setFieldValue(
                "genre",
                newGenre.label
            );

            setSearch("");
            setIsOpen(false);
            setIsSearchMode(false);

        } catch (err) {
            console.error(err);
            alert("Ошибка добавления жанра");
        }
    };

    return (
        <>
            <div className="genre-select">

                <div
                    className="genre-field"
                    onClick={() => {
                        if (!isSearchMode) {
                            setIsOpen(prev => !prev);
                        }
                    }}
                >

                    {!isSearchMode ? (
                        <>
                            <span>
                                {formik.values.genre || "Жанр"}
                            </span>

                            <button
                                type="button"
                                className="close-btn"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    setIsSearchMode(true);
                                    setIsOpen(true);
                                }}
                            >
                                🔍
                            </button>
                        </>
                    ) : (
                        <input
                            autoFocus
                            type="text"
                            placeholder="Поиск жанра..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        />
                    )}
                </div>

                {isOpen && (
                    <div className="genre-dropdown">

                        {filteredGenres.length > 0 ? (
                            filteredGenres.map(genre => (
                                <div
                                    key={genre.value}
                                    className="genre-option"
                                    onClick={() => {

                                        formik.setFieldValue(
                                            "genre",
                                            genre.label
                                        );

                                        setIsOpen(false);
                                        setIsSearchMode(false);
                                        setSearch("");
                                    }}
                                >
                                    <span>
                                        {genre.label}
                                    </span>

                                    <button
                                        type="button"
                                        className="edit-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(genre);
                                        }}
                                    >
                                        ✏️
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="genre-empty">

                                <span>
                                    Ничего не найдено
                                </span>

                                <button
                                    type="button"
                                    className="add-btn"
                                    onClick={handleAddGenre}
                                >
                                    Добавить "{search}"
                                </button>
                            </div>
                        )}

                    </div>
                )}

            </div>

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
import { getGenres, addGenre } from "./api/genreApi";

export async function Genres() {
    return await getGenres();
}

export const NoOptionsMessage = ({ selectProps, inputValue }) => {
    const handleAddGenre = async () => {
        try {
            // вызываем твой API
            const created = await addGenre(inputValue);

            const newGenre = {
                value: created.id,              // лучше id
                label: created.genreName,       // отображаемое имя
            };

            // обновляем список в родительском компоненте
            selectProps.setGenres(prev => [...prev, newGenre]);

            // выбираем новый жанр сразу
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
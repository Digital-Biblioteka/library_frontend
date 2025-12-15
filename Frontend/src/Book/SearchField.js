import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./search.css";
import AdvancedSearchForm from "./SearchForm";

function SearchField() {
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [advancedValues, setAdvancedValues] = useState({
        title: null,
        author: null,
        genre: null,
        description: null
    });

    const handleSearch = () => {
        const queryObject = {
            query: searchValue || null,
            title: advancedValues.title,
            author: advancedValues.author,
            genre: advancedValues.genre,
            description: advancedValues.description
        };

        const encoded = encodeURIComponent(JSON.stringify(queryObject));
        const plainQuery = encodeURIComponent(searchValue || "");

        navigate(`/book-list?query=${plainQuery}&search=${encoded}`);
    };

    const handleAdvancedSubmit = (advData) => {
        setAdvancedValues(advData);

        const queryObject = {
            query: searchValue || null,
            title: advData.title,
            author: advData.author,
            genre: advData.genre,
            description: advData.description
        };

        const encoded = encodeURIComponent(JSON.stringify(queryObject));
        navigate(`/book-list?search=${encoded}`);
    };

    return (
        <div className="search-wrapper">
            <div className="search-container">
                <div className="search-input-wrapper">
                    <input
                        placeholder="я ищу..."
                        className="search-field"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />

                    <button
                        type="button"
                        className="advanced-btn-inside"
                        onClick={() => setShowAdvanced(true)}
                        title="Подробный поиск"
                    >
                        ⚙
                    </button>
                </div>

                {/* модалка */}
                {showAdvanced && (
                    <AdvancedSearchForm
                        onClose={() => setShowAdvanced(false)}
                        onSubmit={handleAdvancedSubmit}
                    />
                )}

                <button className="search-btn" onClick={handleSearch}>
                    Поиск
                </button>

            </div>
        </div>
    );
}

export default SearchField;

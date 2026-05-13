import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./search.css";
import AdvancedSearchForm from "./SearchForm";
import { IconBook, IconQuote, IconSearch } from "./Icons";

function SearchField() {
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [searchMode, setSearchMode] = useState("metadata"); // "metadata" | "quote"

    const [advancedValues, setAdvancedValues] = useState({
        title: null,
        author: null,
        genre: null,
        description: null,
        minRating: null,
        reviewQuery: null
    });

    const handleSearch = () => {
        const plainQuery = encodeURIComponent(searchValue || "");

        if (searchMode === "quote") {
            navigate(`/book-list?query=${plainQuery}&contentSearch=${encodeURIComponent(searchValue || "")}`);
            return;
        }

        const queryObject = {
            query: searchValue || null,
            title: advancedValues.title,
            author: advancedValues.author,
            genre: advancedValues.genre,
            description: advancedValues.description,
            minRating: advancedValues.minRating,
            reviewQuery: advancedValues.reviewQuery
        };

        const encoded = encodeURIComponent(JSON.stringify(queryObject));
        navigate(`/book-list?query=${plainQuery}&search=${encoded}`);
    };

    const handleAdvancedSubmit = (advData) => {
        setAdvancedValues(advData);

        const queryObject = {
            query: searchValue || null,
            title: advData.title,
            author: advData.author,
            genre: advData.genre,
            description: advData.description,
            minRating: advData.minRating,
            reviewQuery: advData.reviewQuery
        };

        const encoded = encodeURIComponent(JSON.stringify(queryObject));
        navigate(`/book-list?search=${encoded}`);
    };

    return (
        <div className="search-wrapper">
            <div className="search-container">
                <div className="search-input-wrapper">
                    <input
                        placeholder={searchMode === "quote" ? "ищу цитату..." : "я ищу..."}
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

                <div className="search-mode-toggle">
                    <button
                        className={`mode-btn ${searchMode === "metadata" ? "active" : ""}`}
                        onClick={() => setSearchMode("metadata")}
                        title="Поиск по метаданным"
                    >
                        <IconBook size={16} color={searchMode === "metadata" ? "#fff" : "#555"} />
                    </button>
                    <button
                        className={`mode-btn ${searchMode === "quote" ? "active" : ""}`}
                        onClick={() => setSearchMode("quote")}
                        title="Поиск по цитате"
                    >
                        <IconQuote size={16} color={searchMode === "quote" ? "#fff" : "#555"} />
                    </button>
                </div>

                <button className="search-btn" onClick={handleSearch}>
                    <IconSearch size={16} color="currentColor" style={{marginRight: 6, verticalAlign: 'middle'}} />
                    Поиск
                </button>

            </div>
        </div>
    );
}

export default SearchField;

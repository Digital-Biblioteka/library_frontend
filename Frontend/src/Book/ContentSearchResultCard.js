import React from "react";
import "./book-list.css";

export default function ContentSearchResultCard({ result, onBookClick }) {
    return (
        <div className="content-result-card" onClick={() => onBookClick(result)}>
            <div className="content-result-header">
                <span className="content-result-title">{result.title || "Без названия"}</span>
                <span className="content-result-author">{result.author || ""}</span>
            </div>
            <div className="content-result-chapter">
                Глава: {result.chapter || "—"}
            </div>
            <div
                className="content-result-snippet"
                dangerouslySetInnerHTML={{ __html: result.textSnippet || "" }}
            />
        </div>
    );
}

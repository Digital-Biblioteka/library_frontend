import React, { useEffect, useState } from "react";
import { getBookPreview } from "./api/readerApi";
import "./book-list.css";
import {getBookReviews} from "./api/reviewApi";
import StarRating from "./Stars";

const STATUS_MAP = {
    INDEXED:     { icon: "\u2713", label: "Проиндексирована" },
    INDEXING:    { icon: "\u27F3", label: "Индексируется..." },
    FAILED:      { icon: "\u2715", label: "Ошибка индексации" },
    NOT_INDEXED: { icon: "\u2014", label: "Не индексирована" },
};

function IndexingBadge({ status }) {
    const entry = STATUS_MAP[status];
    if (!entry) return null;
    const cls = `indexing-badge indexing-${status.toLowerCase()}`;
    return (
        <div className={cls} title={entry.label}>
            <span className={`badge-icon ${status === "INDEXING" ? "badge-spin" : ""}`}>
                {entry.icon}
            </span>
            <span className="badge-label">{entry.label}</span>
        </div>
    );
}

export default function BookCard({ id, book, onClick, isRatingViewed, showIndexingStatus}) {
    const [previewUrl, setPreviewUrl] = useState("");
    const [avgRating, setAvgRating] = useState(0);

    useEffect(() => {
        if (!id) return;
        if (!isRatingViewed) return;

        getBookReviews(id).then(reviews => {
            if (reviews.length === 0) return;

            const avg =
                reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

            setAvgRating(avg);
        }).catch(err => {
            console.error("Ошибка загрузки отзывов:", err);
        });
    }, [id]);

    useEffect(() => {
        let isMounted = true;

        async function loadPreview() {
            try {
                const url = await getBookPreview(id);
                if (isMounted) setPreviewUrl(url);
            } catch (err) {
                console.error("Ошибка загрузки превью:", err);
                if (isMounted) setPreviewUrl("kitten_uwuwuwuwuw.jpg"); // fallback
            }
        }

        void loadPreview();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const hasReviews = book.reviewSnippets && book.reviewSnippets.length > 0;

    if (!hasReviews) {
        return (
            <div className="book-card" onClick={onClick}>
                <img
                    src={previewUrl || "kitten_uwuwuwuwuw.jpg"}
                    alt={book.title}
                    className="book-cover"
                />
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
                {showIndexingStatus && <IndexingBadge status={book.indexingStatus} />}
                <div className="rating-block">
                    <StarRating value={avgRating} readOnly={true}/>
                    <span className="rating-number">
                        {avgRating ? avgRating.toFixed(1) : "—"} / 5
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="book-card review-mode" onClick={onClick}>
            <div className="review-card-header">
                <img
                    src={previewUrl || "kitten_uwuwuwuwuw.jpg"}
                    alt={book.title}
                    className="book-cover"
                />
                <div className="review-card-meta">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">{book.author}</p>

                    {showIndexingStatus && <IndexingBadge status={book.indexingStatus} />}

                    {isRatingViewed && (
                        <div className="rating-block">
                            <StarRating value={avgRating} readOnly={true}/>

                            <span className="rating-number">
                                {avgRating ? avgRating.toFixed(1) : "—"} / 5
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="review-list">
                <h4 className="review-list-title">
                    Отзывы по запросу ({book.reviewSnippets.length})
                </h4>
                {book.reviewSnippets.slice(0, 3).map((snip, i) => (
                    <div key={i} className="review-list-item">
                        <span className="review-item-index">#{i + 1}</span>
                        &ldquo;{snip}&rdquo;
                    </div>
                ))}
                {book.reviewSnippets.length > 3 && (
                    <details className="review-list-more">
                        <summary>Ещё {book.reviewSnippets.length - 3} отзыва...</summary>
                        {book.reviewSnippets.slice(3).map((snip, i) => (
                            <div key={i + 3} className="review-list-item">
                                <span className="review-item-index">#{(i + 4)}</span>
                                &ldquo;{snip}&rdquo;
                            </div>
                        ))}
                    </details>
                )}
            </div>
        </div>
    );
}
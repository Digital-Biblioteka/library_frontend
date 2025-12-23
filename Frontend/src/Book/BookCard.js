import React, { useEffect, useState } from "react";
import { getBookPreview } from "./api/readerApi";
import "./book-list.css";
import {getBookReviews} from "./api/reviewApi";
import StarRating from "./Stars";

export default function BookCard({ id, book, onClick}) {
    const [previewUrl, setPreviewUrl] = useState("");
    const [avgRating, setAvgRating] = useState(0);

    useEffect(() => {
        if (!id) return;

        getBookReviews(id).then(reviews => {
            if (reviews.length === 0) return;

            const avg =
                reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

            setAvgRating(avg);
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

    return (
        <div className="book-card" onClick={onClick}>
            <img
                src={previewUrl || "kitten_uwuwuwuwuw.jpg"}
                alt={book.title}
                className="book-cover"
            />
            <h3 className="book-title">{book.title}</h3>
            <p className="book-author">{book.author}</p>

            <div className="rating-block">
                <StarRating value={avgRating} readOnly={true}/>

                <span className="rating-number">
                    {avgRating ? avgRating.toFixed(1) : "—"} / 5
                </span>
            </div>
        </div>
    );
}

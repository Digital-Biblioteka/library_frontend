import React, { useEffect, useState } from "react";
import StarRating from "./Stars";
import { getBookReviews, createReview, editReview } from "./api/reviewApi";
import "./reviews.css"
import {getEmail} from "../Auth/utils/AuthToken";

export default function ReviewsModal({ bookId, isOpen, onClose }) {
    const token = localStorage.getItem("token");

    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const [editing, setEditing] = useState(false);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState("");

    const userEmail = getEmail();
    const userReview = reviews.find(
        r => r.user?.email === userEmail
    );

    const startEdit = (review) => {
        setEditing(true);
        setEditRating(review.rating);
        setEditComment(review.review_text || "");
    };

    const submitEdit = async () => {
        await editReview(
            {
                rating: editRating,
                comment: editComment
            },
            userReview.id
        );

        setEditing(false);
        setReviews(await getBookReviews(bookId));
    };


    useEffect(() => {
        if (isOpen) {
            getBookReviews(bookId).then(setReviews);
            console.log(getBookReviews(bookId))
        }

        console.log(userReview)
    }, [bookId, isOpen]);

    const submit = async () => {
        await createReview(bookId, {
            rating,
            comment
        });

        setComment("");
        setReviews(await getBookReviews(bookId));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-window" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Отзывы</h3>
                    <button className="close-btn" onClick={onClose}>X</button>
                </div>

                <div className="reviews-list">
                    {reviews.length === 0 && (
                        <p className="empty">Отзывов пока нет</p>
                    )}

                    {reviews.map(r => (
                        <div key={r.id} className="review-card">
                            <div className="review-left">
                                <div className="review-user">
                                    {r.user.username || "Anonim"}
                                </div>
                                {editing && r.user?.email === userEmail ? (
                                    <textarea
                                        value={editComment}
                                        onChange={e => setEditComment(e.target.value)}
                                    />
                                ) : (
                                    r.review_text && (
                                        <div className="review-text">
                                            {r.review_text}
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="review-right">
                                {editing && r.user?.email === userEmail ? (
                                    <StarRating
                                        value={editRating}
                                        onChange={setEditRating}
                                        size={18}
                                    />
                                ) : (
                                    <StarRating
                                        value={r.rating}
                                        readOnly
                                        size={18}
                                    />
                                )}

                                {r.user?.email === userEmail && !editing && (
                                    <button
                                        className="edit-btn"
                                        onClick={() => startEdit(r)}
                                        title="Редактировать отзыв"
                                    >
                                        ✏️
                                    </button>
                                )}
                            </div>

                            {r.user?.email === userEmail && editing && (
                                <div className="edit-actions">
                                    <button
                                        className="save-btn"
                                        onClick={submitEdit}
                                    >
                                        Сохранить
                                    </button>

                                    <button
                                        className="cancel-btn"
                                        onClick={() => setEditing(false)}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {token && !userReview &&(
                    <div className="review-form">
                        <h4>Добавьте отзыв:</h4>

                        <div className="review-field">
                            <StarRating
                                value={rating}
                                onChange={setRating}
                            />

                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Напишите комментарий (необязательно)"
                            />
                        </div>

                        <button className="add-btn" onClick={submit}>
                            Отправить
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

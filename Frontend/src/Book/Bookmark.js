import React, { useEffect, useState } from "react";
import {
    addBookmark,
    getUsersBookmarks,
    deleteBookmark,
    editBookmark
} from "./api/bookmarkApi";

export function useBookmarks(bookId) {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!bookId) return;

        setLoading(true);
        getUsersBookmarks(bookId)
            .then(setBookmarks)
            .finally(() => setLoading(false));
    }, [bookId]);

    const add = async (bm) => {
        const saved = await addBookmark(bookId, bm);
        setBookmarks(prev => [saved, ...prev]);
    };

    const remove = async (id) => {
        await deleteBookmark(id);
        setBookmarks(prev => prev.filter(b => b.id !== id));
    };

    const update = async (id, data) => {
        await editBookmark(id, data);
        setBookmarks(prev =>
            prev.map(b => b.id === id ? { ...b, ...data } : b)
        );
    };

    return {
        bookmarks,
        loading,
        add,
        remove,
        update
    };
}

export const BookmarksPanel = ({ bookmarks, onSelect, onDelete, onUpdate }) => {
    return (
        <div className="bookmark-panel">
            {bookmarks.length === 0 && (
                <div className="bookmark-empty">
                    Закладок нет
                </div>
            )}

            {bookmarks.map(bm => (
                <div key={bm.id} className="bookmark-item">
                        <Bookmark
                            bm={bm}
                            onSelect={onSelect}
                            onDelete={onDelete}
                            onUpdate={onUpdate} />
                </div>
            ))}
        </div>
    );
};

export const Bookmark = ({ bm, onSelect, onDelete, onUpdate }) => {
    const [note, setNote] = useState("");
    return (
        <div className="bookmark-meta">
            <h4 style={{cursor:"pointer"}} onClick={() => onSelect(bm)}>Заметка {bm.spine_reference}</h4>
            <input
                type="text"
                placeholder="Добавьте заметку"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />

            <button onClick={() => onUpdate(bm.id, {
                spineRef: bm.spine_reference,
                paragraphIdx: bm.paragraph_index,
                text: note
            })}>ok</button>
            <button className="bookmark-delete" onClick={() => onDelete(bm.id)}>✕</button>
        </div>
    )
};

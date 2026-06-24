import React, { useEffect, useState } from "react";
import {
    addBookmark,
    getUsersBookmarks,
    deleteBookmark,
    editBookmark,
    createBookmarksGroup,
    joinBookmarksGroup,
    addBookmarkToGroup,
    getUsersBookmarksGroups,
    deleteBookmarkGroup
} from "./api/bookmarkApi";

const getBookmarkGroupId = (bookmark) => (
    bookmark?.groupID
    ?? bookmark?.groupId
    ?? bookmark?.group?.id
    ?? null
);

const getBookmarkText = (bookmark) => (
    bookmark?.text
    ?? bookmark?.text_bookmark
    ?? ""
);

const getSelectedText = (bookmark) => (
    bookmark?.selectedText
    ?? bookmark?.selected_text
    ?? "Выделенный текст"
);

export function useBookmarks(bookId) {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(false);

    const refresh = async () => {
        if (!bookId) return [];

        setLoading(true);
        try {
            const data = await getUsersBookmarks(bookId);
            setBookmarks(data || []);
            return data || [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [bookId]);

    const add = async (bm) => {
        await addBookmark(bookId, bm);
        return await refresh();
    };

    const remove = async (id) => {
        await deleteBookmark(id);
        await refresh();
    };

    const update = async (id, data) => {
        await editBookmark(id, data);
        return await refresh();
    };

    return {
        bookmarks,
        loading,
        add,
        remove,
        update,
        refresh
    };
}


export const BookmarksPanel = ({
                                   bookId,
                                   bookmarks,
                                   bookmarkVisibilityMode,
                                   onBookmarkVisibilityModeChange,
                                   visibleGroupIds,
                                   onVisibleGroupIdsChange,
                                   onSelect,
                                   onDelete,
                                   onUpdate,
                                   onRefresh
                               }) => {
    const [groups, setGroups] = useState([]);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);

    const [groupName, setGroupName] = useState("");
    const [groupVisibility, setGroupVisibility] = useState("PRIVATE");
    const [initialBookmarkId, setInitialBookmarkId] = useState("");

    const [joinToken, setJoinToken] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [error, setError] = useState("");

    const loadGroups = async () => {
        if (!bookId) return;

        setLoadingGroups(true);
        try {
            const data = await getUsersBookmarksGroups(bookId);
            console.log(data)
            setGroups(data || []);
        } finally {
            setLoadingGroups(false);
        }
    };

    useEffect(() => {
        loadGroups();
    }, [bookId]);

    const noGroupBookmarks = bookmarks.filter(bm => !getBookmarkGroupId(bm));

    const getPanelBookmarks = () => {
        if (!selectedGroupId) {
            return bookmarks;
        }

        if (selectedGroupId === "NO_GROUP") {
            return noGroupBookmarks;
        }

        return bookmarks.filter(
            bm => String(getBookmarkGroupId(bm)) === String(selectedGroupId)
        );
    };

    const handleDeleteGroup = async (groupId) => {

        try {
            await deleteBookmarkGroup(groupId);

            if (String(selectedGroupId) === String(groupId)) {
                setSelectedGroupId("");
            }

            onVisibleGroupIdsChange?.(prev =>
                prev.filter(id => String(id) !== String(groupId))
            );

            await onRefresh?.();
            await loadGroups();
        } catch (err) {
            setError(err.message || "Не удалось удалить группу");
        }
    };

    const visibleBookmarks = getPanelBookmarks();

    const toggleVisibleGroup = (groupId) => {
        onBookmarkVisibilityModeChange("SELECTED_GROUPS");

        onVisibleGroupIdsChange(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const isVisibleGroup = (groupId) => {
        return visibleGroupIds.includes(groupId);
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setError("");

        if (!groupName.trim()) {
            setError("Введите название группы");
            return;
        }

        try {
            const createdGroup = await createBookmarksGroup(bookId, {
                name: groupName.trim(),
                visibility: groupVisibility
            });

            const createdGroupId =
                createdGroup?.id
                ?? createdGroup?.groupID
                ?? createdGroup?.groupId;

            if (createdGroupId && initialBookmarkId) {
                await addBookmarkToGroup(initialBookmarkId, createdGroupId);
            }

            await onRefresh?.();
            await loadGroups();

            if (createdGroupId) {
                setSelectedGroupId(String(createdGroupId));
            }

            setGroupName("");
            setGroupVisibility("PRIVATE");
            setInitialBookmarkId("");
            setShowCreateForm(false);
        } catch (err) {
            setError(err.message || "Не удалось создать группу");
        }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        setError("");

        if (!joinToken.trim()) {
            setError("Введите токен приглашения");
            return;
        }

        try {
            await joinBookmarksGroup(joinToken.trim());

            setJoinToken("");
            setShowJoinForm(false);

            await onRefresh?.();
            await loadGroups();
        } catch (err) {
            setError(err.message || "Не удалось присоединиться к группе");
        }
    };

    const handleAddBookmarkToActiveGroup = async (bookmarkId) => {
        if (!selectedGroupId) return;

        try {
            await addBookmarkToGroup(bookmarkId, selectedGroupId);
            await onRefresh?.();
        } catch (err) {
            setError(err.message || "Не удалось добавить закладку в группу");
        }
    };

    return (
        <div className="bookmark-panel">
            <div className="bookmark-actions">
                <button
                    className="save-btn"
                    onClick={() => setShowCreateForm(v => !v)}
                >
                    Создать группу
                </button>

                <button
                    className="save-btn"
                    onClick={() => setShowJoinForm(v => !v)}
                >
                    Присоединиться
                </button>
            </div>

            {showCreateForm && (
                <form className="bookmark-group-form" onSubmit={handleCreateGroup}>
                    <input
                        type="text"
                        placeholder="Название группы"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />

                    <select
                        value={groupVisibility}
                        onChange={(e) => setGroupVisibility(e.target.value)}
                    >
                        <option value="PRIVATE">Приватная</option>
                        <option value="BY_LINK">По ссылке</option>
                    </select>

                    <button className="save-btn" disabled={loadingGroups}>
                        Создать
                    </button>
                </form>
            )}

            {showJoinForm && (
                <form className="bookmark-group-form" onSubmit={handleJoinGroup}>
                    <input
                        type="text"
                        placeholder="Токен / ссылка приглашения"
                        value={joinToken}
                        onChange={(e) => setJoinToken(e.target.value)}
                    />

                    <button className="save-btn" disabled={loadingGroups}>
                        Войти
                    </button>
                </form>
            )}

            {error && <div className="bookmark-error">{error}</div>}

            <div className="bookmark-groups-visibility">
                <div className="bookmark-groups-title">
                    Показывать в книге
                </div>

                <label className="bookmark-group-check">
                    <input
                        type="radio"
                        name="bookmarkVisibilityMode"
                        checked={bookmarkVisibilityMode === "ALL"}
                        onChange={() => onBookmarkVisibilityModeChange("ALL")}
                    />
                    Все закладки
                </label>

                <label className="bookmark-group-check">
                    <input
                        type="radio"
                        name="bookmarkVisibilityMode"
                        checked={bookmarkVisibilityMode === "NO_GROUP"}
                        onChange={() => onBookmarkVisibilityModeChange("NO_GROUP")}
                    />
                    Без группы
                </label>

                <label className="bookmark-group-check">
                    <input
                        type="radio"
                        name="bookmarkVisibilityMode"
                        disabled={groups.length === 0}
                        checked={bookmarkVisibilityMode === "SELECTED_GROUPS"}
                        onChange={() => onBookmarkVisibilityModeChange("SELECTED_GROUPS")}
                    />
                    Выбранные группы
                </label>

                {groups.map(group => {
                    const groupId = String(group.id ?? group.groupID ?? group.groupId);

                    return (
                        <div key={groupId} className="bookmark-group-row">
                            <label className="bookmark-group-check">
                                <input
                                    type="checkbox"
                                    disabled={bookmarkVisibilityMode !== "SELECTED_GROUPS"}
                                    checked={isVisibleGroup(groupId)}
                                    onChange={() => toggleVisibleGroup(groupId)}
                                />
                                {group.name}
                            </label>

                            <button
                                type="button"
                                className="delete-btn"
                                onClick={() => handleDeleteGroup(groupId)}
                                title="Удалить группу"
                            >
                                ✕
                            </button>
                        </div>
                    );
                })}
            </div>

            {visibleBookmarks.length === 0 && (
                <div className="bookmark-empty">
                    {selectedGroupId
                        ? "В этой группе пока нет закладок"
                        : "Закладок нет"}
                </div>
            )}

            {visibleBookmarks.map(bm => (
                <div key={bm.id} className="bookmark-item">
                    <Bookmark
                        bm={bm}
                        selectedGroupId={selectedGroupId}
                        onSelect={onSelect}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                    />
                </div>
            ))}

            {selectedGroupId && selectedGroupId !== "NO_GROUP" && noGroupBookmarks.length > 0 && (                <div className="bookmark-add-to-group-list">
                    <h4>Добавить личную закладку в группу</h4>

                    {noGroupBookmarks.map(bm => (
                        <button
                            key={bm.id}
                            className="bookmark-add-to-group"
                            onClick={() => handleAddBookmarkToActiveGroup(bm.id)}
                        >
                            + {getSelectedText(bm)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Bookmark = ({
                             bm,
                             selectedGroupId,
                             onSelect,
                             onDelete,
                             onUpdate
                         }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [note, setNote] = useState(getBookmarkText(bm));

    const selectedText = getSelectedText(bm);
    const savedNote = getBookmarkText(bm);

    useEffect(() => {
        setNote(getBookmarkText(bm));
    }, [bm]);

    const handleSave = async () => {
        await onUpdate(bm.id, {
            spineRef: bm.spineRef ?? bm.spine_reference,
            paragraphIdx: bm.paragraphIdx ?? bm.paragraph_index,
            startOffset: bm.startOffset ?? bm.start_offset,
            endOffset: bm.endOffset ?? bm.end_offset,
            groupID: getBookmarkGroupId(bm),
            text: note,
            selectedText,
            color: bm.color
        });

        setIsEditing(false);
    };

    const handleCancel = () => {
        setNote(savedNote);
        setIsEditing(false);
    };

    return (
        <div className="bookmark-card">
            <div
                className="bookmark-card-text"
                onClick={() => onSelect(bm)}
            >
                “{selectedText}”
            </div>

            {!isEditing ? (
                <>
                    <div className="bookmark-card-note">
                        {savedNote
                            ? savedNote
                            : <span className="bookmark-empty-note">Без заметки</span>}
                    </div>

                    <div className="bookmark-card-actions">
                        <button className="add-btn" onClick={() => setIsEditing(true)}>
                            Редактировать
                        </button>

                        {!selectedGroupId && (
                            <button
                                className="delete-btn"
                                onClick={() => onDelete(bm.id)}
                            >
                                Удалить
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <textarea
                        className="bookmark-edit-note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Заметка"
                    />

                    <div className="bookmark-card-actions">
                        <button className="save-btn" onClick={handleSave}>
                            Сохранить
                        </button>

                        <button className="action-btn" onClick={handleCancel}>
                            Отмена
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
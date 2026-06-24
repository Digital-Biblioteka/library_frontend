import React, { useEffect, useState } from "react";
import {
    addBookmark,
    getUsersBookmarks,
    deleteBookmark,
    editBookmark,
    createBookmarksGroup,
    joinBookmarksGroup,
    addBookmarkToGroup,
    deleteBookmarkGroup,
    getAllBookmarksInGroup
} from "./api/bookmarkApi";

const getBookmarkGroupId = (bookmark) => (
    bookmark?.groupID
    ?? bookmark?.groupId
    ?? bookmark?.group?.id
    ?? null
);

const getGroupId = (group) => (
    group?.id
    ?? group?.groupID
    ?? group?.groupId
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

const getBookmarkAuthor = (bookmark) => (
    bookmark?.user?.username
    ?? bookmark?.user?.email
    ?? ""
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
                                   groups = [],
                                   groupedBookmarkIds = [],
                                   onRefreshGroups,
                                   bookmarkVisibilityMode,
                                   onBookmarkVisibilityModeChange,
                                   visibleGroupIds,
                                   onVisibleGroupIdsChange,
                                   onSelect,
                                   onDelete,
                                   onUpdate,
                                   onRefresh
                               }) => {

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);

    const [groupName, setGroupName] = useState("");
    const [groupVisibility, setGroupVisibility] = useState("PRIVATE");
    const [initialBookmarkId, setInitialBookmarkId] = useState("");

    const [joinToken, setJoinToken] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [error, setError] = useState("");
    const [createdGroupInviteLink, setCreatedGroupInviteLink] = useState("");

    const [groupBookmarks, setGroupBookmarks] = useState([]);
    const [visiblePanelBookmarks, setVisiblePanelBookmarks] = useState([]);

    const noGroupBookmarks = bookmarks.filter(
        bm => !groupedBookmarkIds.includes(Number(bm.id))
    );

    const loadVisiblePanelBookmarks = async () => {
        if (
            bookmarkVisibilityMode !== "SELECTED_GROUPS" ||
            visibleGroupIds.length === 0
        ) {
            setVisiblePanelBookmarks([]);
            return [];
        }

        const result = [];

        for (const groupId of visibleGroupIds) {
            const data = await getAllBookmarksInGroup(groupId);
            result.push(...(data || []));
        }

        const unique = Array.from(
            new Map(result.map(bookmark => [bookmark.id, bookmark])).values()
        );

        setVisiblePanelBookmarks(unique);
        return unique;
    };

    useEffect(() => {
        loadVisiblePanelBookmarks();
    }, [bookmarkVisibilityMode, visibleGroupIds]);

    const loadSelectedGroupBookmarks = async () => {
        if (!selectedGroupId || selectedGroupId === "NO_GROUP") {
            setGroupBookmarks([]);
            return [];
        }

        const data = await getAllBookmarksInGroup(selectedGroupId);
        setGroupBookmarks(data || []);
        return data || [];
    };

    useEffect(() => {
        loadSelectedGroupBookmarks();
    }, [selectedGroupId]);

    const getPanelBookmarks = () => {
        if (bookmarkVisibilityMode === "ALL") {
            return bookmarks;
        }

        if (bookmarkVisibilityMode === "NO_GROUP") {
            return noGroupBookmarks;
        }

        if (bookmarkVisibilityMode === "SELECTED_GROUPS") {
            return visiblePanelBookmarks;
        }

        if (!selectedGroupId) {
            return bookmarks;
        }

        if (selectedGroupId === "NO_GROUP") {
            return noGroupBookmarks;
        }

        return groupBookmarks;
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

    const buildInviteLink = (accessToken) => {
        if (!accessToken) return "";

        return `${window.location.origin}/bookmarks/groups/join/${accessToken}`;
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setError("");

        if (!groupName.trim()) {
            setError("Введите название группы");
            return;
        }

        setLoadingGroups(true);

        try {
            const createdGroup = await createBookmarksGroup(bookId, {
                name: groupName.trim(),
                visibility: groupVisibility
            });

            const accessToken =
                createdGroup?.accessToken
                ?? createdGroup?.access_token
                ?? createdGroup?.inviteToken
                ?? createdGroup?.token
                ?? "";

            if (groupVisibility === "BY_LINK" && accessToken) {
                setCreatedGroupInviteLink(buildInviteLink(accessToken));
            } else {
                setCreatedGroupInviteLink("");
            }

            await onRefresh?.();
            await onRefreshGroups?.();

            const createdGroupId =
                createdGroup?.id
                ?? createdGroup?.groupID
                ?? createdGroup?.groupId;

            if (createdGroupId && initialBookmarkId) {
                await addBookmarkToGroup(initialBookmarkId, createdGroupId);
                await onRefresh?.()
            }

            if (createdGroupId) {
                setSelectedGroupId(String(createdGroupId));
            }

            setGroupName("");
            setGroupVisibility("PRIVATE");
            setInitialBookmarkId("");
            setShowCreateForm(false);
        } catch (err) {
            setError(err.message || "Не удалось создать группу");
        } finally {
            setLoadingGroups(false)
        }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        setError("");

        if (!joinToken.trim()) {
            setError("Введите токен приглашения");
            return;
        }

        setLoadingGroups(true);

        try {
            await joinBookmarksGroup(joinToken.trim());

            setJoinToken("");
            setShowJoinForm(false);

            await onRefresh?.();
            await onRefreshGroups?.();
        } catch (err) {
            setError(err.message || "Не удалось присоединиться к группе");
        } finally {
            setLoadingGroups(false);
        }
    };

    const handleAddBookmarkToGroup = async (bookmarkId, groupId) => {
        if (!bookmarkId || !groupId) return;

        setError("");

        console.log(bookmarkId, groupId)

        try {
            await addBookmarkToGroup(bookmarkId, groupId);

            await onRefresh?.();
            await onRefreshGroups?.();

            await loadSelectedGroupBookmarks();
            await loadVisiblePanelBookmarks();

            if (String(groupId) === String(selectedGroupId)) {
                await loadSelectedGroupBookmarks();
            }
        } catch (err) {
            setError(err.message || "Не удалось добавить закладку в группу");
        }
    };

    const handleAddBookmarkToActiveGroup = async (bookmarkId) => {
        if (!selectedGroupId || selectedGroupId === "NO_GROUP") return;

        await handleAddBookmarkToGroup(bookmarkId, selectedGroupId);
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

            {createdGroupInviteLink && (
                <div className="bookmark-invite-link-box">
                    <div className="bookmark-groups-title">
                        Ссылка для приглашения
                    </div>

                    <input
                        type="text"
                        readOnly
                        value={createdGroupInviteLink}
                        onFocus={(e) => e.target.select()}
                    />

                    <button
                        type="button"
                        className="save-btn"
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(createdGroupInviteLink);
                                setCreatedGroupInviteLink(false);
                            } catch (err) {
                                console.error('Failed to copy:', err);
                            }
                        }}
                    >
                        Скопировать
                    </button>
                </div>
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
                    const active = isVisibleGroup(groupId);

                    return (
                        <div
                            key={groupId}
                            className={`bookmark-group-row ${active ? "active" : ""}`}
                        >
                            <label className="bookmark-group-check">
                                <input
                                    type="checkbox"
                                    disabled={bookmarkVisibilityMode !== "SELECTED_GROUPS"}
                                    checked={active}
                                    onChange={() => toggleVisibleGroup(groupId)}
                                />

                                <span className="bookmark-group-name">
                                    {group.name}
                                </span>
                            </label>

                            <button
                                type="button"
                                className="bookmark-group-delete"
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
                        groups={groups}
                        selectedGroupId={selectedGroupId}
                        onSelect={onSelect}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                        onAddToGroup={handleAddBookmarkToGroup}
                    />
                </div>
            ))}

            {selectedGroupId && selectedGroupId !== "NO_GROUP" && noGroupBookmarks.length > 0 && (
                <div className="bookmark-add-to-group-list">
                    <h4>Добавить закладку в эту группу</h4>

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
                             groups = [],
                             selectedGroupId,
                             onSelect,
                             onDelete,
                             onUpdate,
                             onAddToGroup
                         }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [note, setNote] = useState(getBookmarkText(bm));
    const author = getBookmarkAuthor(bm);
    const bookmarkColor = bm.color || "#90caf9";

    const [targetGroupId, setTargetGroupId] = useState(
        getBookmarkGroupId(bm) ? String(getBookmarkGroupId(bm)) : ""
    );

    const selectedText = getSelectedText(bm);
    const savedNote = getBookmarkText(bm);

    const handleChangeGroup = async () => {
        if (!targetGroupId) return;

        await onAddToGroup?.(bm.id, targetGroupId);
    };

    useEffect(() => {
        setNote(getBookmarkText(bm));
        setTargetGroupId(
            getBookmarkGroupId(bm) ? String(getBookmarkGroupId(bm)) : ""
        );
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

    const previewText =
        selectedText.length > 150
            ? `${selectedText.slice(0, 150)}...`
            : selectedText;

    return (
        <div className="bookmark-card">
            <div
                className="bookmark-card-text"
                onClick={() => onSelect(bm)}
            >
                “{previewText}”
            </div>

            {!isEditing ? (
                <>
                    <div className="bookmark-card-note">
                        <div className="bookmark-note-header">
                            <span
                                className="bookmark-note-color"
                                style={{ backgroundColor: bookmarkColor }}
                            />

                            <span className="bookmark-note-author">
                                {author}
                            </span>
                        </div>

                        <div className="bookmark-note-text">
                            {savedNote
                                ? savedNote
                                : <span className="bookmark-empty-note">Без заметки</span>}
                        </div>
                    </div>

                    <div className="bookmark-card-group">
                        <select
                            value={targetGroupId}
                            onChange={(e) => setTargetGroupId(e.target.value)}
                        >
                            <option >Без группы</option>

                            {groups.map(group => {
                                const groupId = getGroupId(group);

                                return (
                                    <option key={groupId} value={groupId}>
                                        {group.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="bookmark-card-actions">
                        <button
                            className="save-btn"
                            disabled={!targetGroupId}
                            onClick={handleChangeGroup}>
                            Добавить в группу
                        </button>
                        <button className="add-btn" onClick={() => setIsEditing(true)}>
                            Редактировать
                        </button>

                        <button
                            className="delete-btn"
                            onClick={() => onDelete(bm.id)}
                        >
                            Удалить
                        </button>
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
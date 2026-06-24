import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./reader.css";
import "./bookmark.css";
import {
    getLastReadingPos,
    getToc,
    postReadingPos,
    getChapByToc,
    getChapByIdx
} from "./api/readerApi";
import { getBookmarkGroupsByBook } from "./api/bookmarkApi";
import { searchContent } from "./api/contentSearchApi";
import { useBookmarks, BookmarksPanel } from "./Bookmark";
import { IconSearch } from "./Icons";

const BOOKMARK_COLORS = [
    "#fff176",
    "#ffab91",
    "#a5d6a7",
    "#90caf9",
    "#ce93d8"
];

const BOOKMARK_BLOCK_SELECTOR = "p, td, blockquote";

const getReadableBlocks = (container) => {
    if (!container) return [];

    const article = container.querySelector(".chapter-html") || container;

    return Array.from(article.querySelectorAll(BOOKMARK_BLOCK_SELECTOR))
        .filter(block => block.textContent.trim().length > 0);
};

const prepareBookmarkBlocks = (container) => {
    const blocks = getReadableBlocks(container);

    blocks.forEach((block, idx) => {
        block.dataset.blockIdx = String(idx);
        block.classList.add("block-wrapper");
    });

    return blocks;
};

const unwrapBookmarkHighlights = (root) => {
    root.querySelectorAll(".bookmark-text-highlight").forEach((span) => {
        const parent = span.parentNode;

        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
        }

        parent.removeChild(span);
        parent.normalize();
    });
};

const getSelectedBookmarkData = (container, event) => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return null;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    if (!selectedText.trim()) return null;

    const startElement =
        range.startContainer.nodeType === Node.TEXT_NODE
            ? range.startContainer.parentElement
            : range.startContainer;

    const endElement =
        range.endContainer.nodeType === Node.TEXT_NODE
            ? range.endContainer.parentElement
            : range.endContainer;

    if (
        startElement?.closest(".bookmark-text-highlight") ||
        endElement?.closest(".bookmark-text-highlight")
    ) {
        alert("Нельзя создавать новую закладку внутри уже подсвеченного текста");
        return null;
    }

    const blocks = getReadableBlocks(container);

    const clickedBlock =
        event.target.closest(BOOKMARK_BLOCK_SELECTOR)
        || range.startContainer.parentElement?.closest(BOOKMARK_BLOCK_SELECTOR);

    if (!clickedBlock) return null;

    const paragraphIdx = blocks.indexOf(clickedBlock);

    if (paragraphIdx === -1) return null;

    if (!range.intersectsNode(clickedBlock)) return null;

    const startRange = document.createRange();
    startRange.selectNodeContents(clickedBlock);
    startRange.setEnd(range.startContainer, range.startOffset);

    const endRange = document.createRange();
    endRange.selectNodeContents(clickedBlock);
    endRange.setEnd(range.endContainer, range.endOffset);

    const startOffset = startRange.toString().length;
    const endOffset = endRange.toString().length;

    if (startOffset === endOffset) return null;

    return {
        paragraphIdx,
        startOffset: Math.min(startOffset, endOffset),
        endOffset: Math.max(startOffset, endOffset),
        selectedText: selectedText.trim()
    };
};

const wrapTextRange = (block, startOffset, endOffset, color, note) => {
    if (!block) return;

    startOffset = Number(startOffset);
    endOffset = Number(endOffset);

    if (Number.isNaN(startOffset) || Number.isNaN(endOffset)) return;
    if (startOffset >= endOffset) return;

    const walker = document.createTreeWalker(
        block,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
                if (!node.nodeValue) return NodeFilter.FILTER_REJECT;

                if (node.parentElement?.closest(".bookmark-text-highlight")) {
                    return NodeFilter.FILTER_REJECT;
                }

                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let currentOffset = 0;
    const ranges = [];

    while (walker.nextNode()) {
        const node = walker.currentNode;
        const nodeStart = currentOffset;
        const nodeEnd = nodeStart + node.nodeValue.length;

        const from = Math.max(startOffset, nodeStart);
        const to = Math.min(endOffset, nodeEnd);

        if (from < to) {
            ranges.push({
                node,
                start: from - nodeStart,
                end: to - nodeStart
            });
        }

        currentOffset = nodeEnd;
    }

    ranges.reverse().forEach(({ node, start, end }) => {
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, end);

        const span = document.createElement("span");
        span.className = "bookmark-text-highlight";
        span.style.backgroundColor = color || "#fff176";
        span.title = note || "Без заметки";

        const content = range.extractContents();
        span.appendChild(content);
        range.insertNode(span);
    });
};

const getBookmarkSpineRef = (bookmark) =>
    bookmark?.spineRef ?? bookmark?.spine_reference ?? bookmark?.spineReference;

const getBookmarkParagraphIdx = (bookmark) =>
    bookmark?.paragraphIdx ?? bookmark?.paragraph_index ?? bookmark?.paragraphIndex;

const getBookmarkStartOffset = (bookmark) =>
    bookmark?.startOffset ?? bookmark?.start_offset ?? 0;

const getBookmarkEndOffset = (bookmark) =>
    bookmark?.endOffset ?? bookmark?.end_offset ?? 0;

const getBookmarkGroupId = (bookmark) =>
    bookmark?.groupID ?? bookmark?.groupId ?? null;

const getBookmarkGroupName = (bookmark, groupId) =>
    bookmark?.group?.name
    ?? bookmark?.bookmarkGroup?.name
    ?? bookmark?.groupName
    ?? `Группа ${groupId}`;

const buildGroupsFromBookmarks = (bookmarks) => {
    const map = new Map();

    bookmarks.forEach((bookmark) => {
        const groupId = getBookmarkGroupId(bookmark);

        if (!groupId || map.has(String(groupId))) return;

        map.set(String(groupId), {
            id: groupId,
            name: getBookmarkGroupName(bookmark, groupId)
        });
    });

    return Array.from(map.values());
};

const TocItem = ({ item, goToItem, level = 0 }) => (
    <div>
        <div
            className="toc-item"
            style={{ paddingLeft: `${level * 15}px` }}
            onClick={() => goToItem(item)}
        >
            {item.title}
        </div>

        {item.children?.map((sub, id) => (
            <TocItem
                key={id}
                item={sub}
                goToItem={goToItem}
                level={level + 1}
            />
        ))}
    </div>
);

const Reader = () => {
    const containerRef = useRef(null);
    const spineRef = useRef(0);
    const saveTimerRef = useRef(null);

    const { state } = useLocation();
    const navigate = useNavigate();

    const title = state?.title || "Без названия";
    const id = state?.id;
    const searchChapterIndex = state?.searchChapterIndex;
    const searchParagraphIndex = state?.searchParagraphIndex;

    const [html, setHtml] = useState("");
    const [toc, setToc] = useState([]);
    const [tocVis, setTocVis] = useState(false);
    const [progress, setProgress] = useState(0);

    const [spineIdx, setSpineIdx] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);
    const [total, setTotal] = useState(1);

    const [bmVis, setBmVis] = useState(false);
    const [selectionMenu, setSelectionMenu] = useState(null);
    const [bookmarkDraft, setBookmarkDraft] = useState(null);
    const [bookmarkNote, setBookmarkNote] = useState("");
    const [bookmarkColor, setBookmarkColor] = useState(BOOKMARK_COLORS[0]);
    const [bookmarkGroupId, setBookmarkGroupId] = useState("");
    const [bookmarkVisibilityMode, setBookmarkVisibilityMode] = useState("ALL");
    const [visibleGroupIds, setVisibleGroupIds] = useState([]);

    const [searchVis, setSearchVis] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const {
        bookmarks,
        add: addBookmark,
        remove: deleteBookmark,
        update: editBookmark,
        refresh: refreshBookmarks
    } = useBookmarks(id);

    const shouldShowBookmark = (bookmark) => {
        if (bookmarkVisibilityMode === "ALL") {
            return true;
        }

        const groupId = getBookmarkGroupId(bookmark);

        if (bookmarkVisibilityMode === "NO_GROUP") {
            return !groupId;
        }

        if (bookmarkVisibilityMode === "SELECTED_GROUPS") {
            return groupId && visibleGroupIds.includes(String(groupId));
        }

        return true;
    };

    const bookmarkGroups = useMemo(
        () => buildGroupsFromBookmarks(bookmarks),
        [bookmarks]
    );

    const [fontSize, setFontSize] = useState(
        Number(localStorage.getItem("reader-font")) || 18
    );

    const [theme, setTheme] = useState(
        localStorage.getItem("reader-theme") || "light"
    );

    useEffect(() => {
        localStorage.setItem("reader-font", fontSize);
    }, [fontSize]);

    useEffect(() => {
        localStorage.setItem("reader-theme", theme);
    }, [theme]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        requestAnimationFrame(() => {
            unwrapBookmarkHighlights(container);

            const blocks = prepareBookmarkBlocks(container);

            const currentBookmarks = bookmarks
                .filter(bookmark => Number(getBookmarkSpineRef(bookmark)) === Number(spineIdx))
                .filter(shouldShowBookmark)
                .sort(
                    (a, b) =>
                        Number(getBookmarkStartOffset(b)) -
                        Number(getBookmarkStartOffset(a))
                );

            currentBookmarks.forEach((bookmark) => {
                const paragraphIdx = Number(getBookmarkParagraphIdx(bookmark));
                const startOffset = Number(getBookmarkStartOffset(bookmark));
                const endOffset = Number(getBookmarkEndOffset(bookmark));

                if (Number.isNaN(paragraphIdx)) return;
                if (Number.isNaN(startOffset)) return;
                if (Number.isNaN(endOffset)) return;
                if (endOffset <= startOffset) return;

                const block = blocks[paragraphIdx];

                if (!block) {
                    console.warn("Блок для подсветки не найден", {
                        paragraphIdx,
                        blocksCount: blocks.length,
                        bookmark
                    });
                    return;
                }

                wrapTextRange(
                    block,
                    startOffset,
                    endOffset,
                    bookmark.color || "#fff176",
                    bookmark.text_bookmark || ""
                );
            });
        });
    }, [html, bookmarks, spineIdx]);

    useEffect(() => {
        setProgress(total > 1 ? spineIdx / (total - 1) : 0);
    }, [spineIdx, total, html]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleContextMenu = (e) => {
            const selectionData = getSelectedBookmarkData(container, e);

            if (!selectionData) {
                setSelectionMenu(null);
                setBookmarkDraft(null);
                return;
            }

            e.preventDefault();

            setBookmarkDraft(selectionData);
            setSelectionMenu({
                x: e.clientX,
                y: e.clientY
            });
        };

        container.addEventListener("contextmenu", handleContextMenu);

        return () => {
            container.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [html]);

    const highlightBlock = (block) => {
        block.classList.add("search-highlight-block");
    };

    const clearHighlights = () => {
        const container = containerRef.current;
        if (!container) return;

        container.querySelectorAll(".search-highlight-block").forEach(el => {
            el.classList.remove("search-highlight-block");
        });

        container.removeEventListener("click", clearHighlights);
        container.removeEventListener("wheel", clearHighlights);
        container.removeEventListener("touchstart", clearHighlights);
    };

    const clearHighlightsOnInteraction = () => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener("click", clearHighlights, { once: true });
        container.addEventListener("wheel", clearHighlights, { once: true });
        container.addEventListener("touchstart", clearHighlights, { once: true });
    };

    const loadChapter = async (loader) => {
        const chapter = await loader();

        setHtml(chapter.html);
        setSpineIdx(chapter.spineIdx);
        setHasNext(chapter.hasNext);
        setHasPrev(chapter.hasPrev);
        setTotal(chapter.totalSpines);

        spineRef.current = chapter.spineIdx;

        setSelectionMenu(null);
        setBookmarkDraft(null);

        requestAnimationFrame(() => {
            containerRef.current?.scrollTo({ top: 0 });
        });
    };

    const saveReadingPos = async () => {
        if (!id) return;

        try {
            await postReadingPos(id, spineRef.current);
        } catch (e) {
            console.error("Ошибка сохранения позиции", e);
        }
    };

    useEffect(() => {
        if (!id) return;

        saveTimerRef.current = setInterval(saveReadingPos, 30_000);

        (async () => {
            const tocData = await getToc(id);
            setToc(tocData);

            let startSpine = 2;

            if (searchChapterIndex != null) {
                startSpine = Number(searchChapterIndex);
            } else {
                const lastPos = await getLastReadingPos(id);

                if (
                    lastPos?.position &&
                    lastPos.position !== "0" &&
                    lastPos.position !== "NaN"
                ) {
                    startSpine = Number(lastPos.position);
                }
            }

            await loadChapter(() => getChapByIdx(id, startSpine));

            if (searchParagraphIndex != null) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const container = containerRef.current;
                        if (!container) return;

                        const blocks = prepareBookmarkBlocks(container);
                        const block = blocks[Number(searchParagraphIndex)];

                        if (block) {
                            block.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });

                            block.classList.add("bookmark-focus");

                            setTimeout(() => {
                                block.classList.remove("bookmark-focus");
                            }, 1200);

                            highlightBlock(block);
                            clearHighlightsOnInteraction();
                        }
                    });
                });
            }
        })();

        return () => clearInterval(saveTimerRef.current);
    }, [id]);

    const next = () => {
        if (hasNext) {
            void loadChapter(() => getChapByIdx(id, spineIdx + 1));
        }
    };

    const prev = () => {
        if (hasPrev) {
            void loadChapter(() => getChapByIdx(id, spineIdx - 1));
        }
    };

    const goToTocItem = (item) => {
        setTocVis(false);
        void loadChapter(() => getChapByToc(id, item));
    };

    const goToBookmark = async (bookmark) => {
        if (!bookmark) return;

        const targetSpine = Number(getBookmarkSpineRef(bookmark));
        const targetParagraph = Number(getBookmarkParagraphIdx(bookmark));

        if (targetSpine !== spineIdx) {
            await loadChapter(() => getChapByIdx(id, targetSpine));
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const container = containerRef.current;
                if (!container) return;

                const blocks = prepareBookmarkBlocks(container);
                const block = blocks[targetParagraph];

                if (!block) {
                    console.warn("Блок не найден", targetParagraph);
                    return;
                }

                block.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                block.classList.add("bookmark-focus");

                setTimeout(() => {
                    block.classList.remove("bookmark-focus");
                }, 1200);
            });
        });
    };

    const handleExit = () => {
        void saveReadingPos();
        navigate(-1);
    };

    const handleContentSearch = async () => {
        if (!searchQuery.trim() || !id) return;

        try {
            const results = await searchContent(searchQuery, id, 20);
            setSearchResults(results);
        } catch (e) {
            console.error("Ошибка поиска внутри книги", e);
        }
    };

    const goToSearchResult = async (result) => {
        setSearchVis(false);
        setSearchResults([]);
        setSearchQuery("");

        const targetIdx =
            result.spineIndex != null && result.spineIndex >= 0
                ? result.spineIndex
                : result.chapterIndex;

        if (targetIdx !== spineIdx) {
            await loadChapter(() => getChapByIdx(id, targetIdx));
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const container = containerRef.current;
                if (!container) return;

                const blocks = prepareBookmarkBlocks(container);
                const block = blocks[Number(result.paragraphIndex)];

                if (block) {
                    block.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                    block.classList.add("bookmark-focus");

                    setTimeout(() => {
                        block.classList.remove("bookmark-focus");
                    }, 1200);
                }
            });
        });
    };

    const closeBookmarkCreateModal = () => {
        setBookmarkDraft(null);
        setSelectionMenu(null);
        setBookmarkNote("");
        setBookmarkColor(BOOKMARK_COLORS[0]);
        setBookmarkGroupId("");
        window.getSelection()?.removeAllRanges();
    };

    const openBookmarkCreateModal = () => {
        if (!bookmarkDraft) return;

        setSelectionMenu(null);
        setBookmarkNote("");
        setBookmarkColor(BOOKMARK_COLORS[0]);
        setBookmarkGroupId("");
    };

    const saveSelectedTextBookmark = async () => {
        if (!bookmarkDraft) return;

        const bookmarkDto = {
            spineRef: spineIdx,
            paragraphIdx: bookmarkDraft.paragraphIdx,
            startOffset: bookmarkDraft.startOffset,
            endOffset: bookmarkDraft.endOffset,
            groupID: bookmarkGroupId || null,
            text: bookmarkNote || "",
            selectedText: bookmarkDraft.selectedText,
            color: bookmarkColor
        };

        await addBookmark(bookmarkDto);

        closeBookmarkCreateModal();
        setBmVis(true);
    };

    return (
        <div className="reader-wrapper">
            <div className="reader-header">
                <div className="header-left">
                    <button className="back-btn" onClick={handleExit}>←</button>

                    <button
                        className="font-btn"
                        onClick={() => setFontSize(f => Math.max(14, f - 2))}
                    >
                        A−
                    </button>

                    <button
                        className="font-btn"
                        onClick={() => setFontSize(f => Math.min(28, f + 2))}
                    >
                        A+
                    </button>

                    <button className="theme-btn" onClick={() => setTheme("light")}>
                        ☼
                    </button>

                    <button className="theme-btn" onClick={() => setTheme("dark")}>
                        ☽
                    </button>

                    <button className="close-btn" onClick={() => setTocVis(v => !v)}>
                        ☰
                    </button>

                    <button className="bookmark-btn" onClick={() => setBmVis(v => !v)}>
                        ⚐
                    </button>

                    <button
                        className="search-btn-reader"
                        onClick={() => setSearchVis(v => !v)}
                    >
                        <IconSearch size={18} />
                    </button>
                </div>

                <div className="header-center">{title}</div>
            </div>

            <div className="reader-progress">
                <div
                    className="reader-progress-bar"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>

            {selectionMenu && (
                <div
                    className="bookmark-context-menu"
                    style={{
                        left: selectionMenu.x,
                        top: selectionMenu.y
                    }}
                >
                    <button onClick={openBookmarkCreateModal}>
                        Добавить закладку?
                    </button>
                </div>
            )}

            {bookmarkDraft && !selectionMenu && (
                <div className="bookmark-modal-backdrop">
                    <div className="bookmark-create-modal">
                        <h3>Новая закладка</h3>

                        <div className="bookmark-selected-preview">
                            {bookmarkDraft.selectedText}
                        </div>

                        <label>
                            Заметка
                            <textarea
                                placeholder="Можно оставить пустой"
                                value={bookmarkNote}
                                onChange={(e) => setBookmarkNote(e.target.value)}
                            />
                        </label>

                        <label>
                            Цвет
                            <div className="bookmark-color-list">
                                {BOOKMARK_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={
                                            color === bookmarkColor
                                                ? "bookmark-color active"
                                                : "bookmark-color"
                                        }
                                        style={{ backgroundColor: color }}
                                        onClick={() => setBookmarkColor(color)}
                                    />
                                ))}
                            </div>
                        </label>

                        {bookmarkGroups.length > 0 && (
                            <label>
                                Группа
                                <select
                                    value={bookmarkGroupId}
                                    onChange={(e) => setBookmarkGroupId(e.target.value)}
                                >
                                    <option value="">Личная закладка</option>

                                    {bookmarkGroups.map(group => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}

                        <div className="bookmark-modal-actions">
                            <button onClick={closeBookmarkCreateModal}>
                                Отмена
                            </button>

                            <button className="save-btn" onClick={saveSelectedTextBookmark}>
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {bmVis && (
                <BookmarksPanel
                    bookId={id}
                    bookmarks={bookmarks}
                    bookmarkVisibilityMode={bookmarkVisibilityMode}
                    onBookmarkVisibilityModeChange={setBookmarkVisibilityMode}
                    visibleGroupIds={visibleGroupIds}
                    onVisibleGroupIdsChange={setVisibleGroupIds}
                    onSelect={goToBookmark}
                    onDelete={deleteBookmark}
                    onUpdate={editBookmark}
                    onRefresh={refreshBookmarks}
                />
            )}

            {searchVis && (
                <div className="reader-search-panel">
                    <div className="reader-search-input-row">
                        <input
                            className="reader-search-input"
                            placeholder="Поиск по книге..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleContentSearch();
                            }}
                        />

                        <button
                            className="reader-search-go"
                            onClick={handleContentSearch}
                        >
                            Найти
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="reader-search-results">
                            {searchResults.map((r, idx) => (
                                <div
                                    key={idx}
                                    className="reader-search-result-item"
                                    onClick={() => goToSearchResult(r)}
                                >
                                    <span className="reader-search-result-chapter">
                                        {r.chapter}
                                    </span>

                                    <span
                                        className="reader-search-result-snippet"
                                        dangerouslySetInnerHTML={{ __html: r.textSnippet }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tocVis && (
                <div className="toc-panel">
                    {toc.map((item, id) => (
                        <TocItem
                            key={id}
                            item={item}
                            goToItem={goToTocItem}
                        />
                    ))}
                </div>
            )}

            <div className="reader-main">
                {hasPrev && (
                    <div className="nav-button left" onClick={prev}>
                        &lt;
                    </div>
                )}

                <div className={`chapter theme-${theme}`} ref={containerRef}>
                    <article
                        className="chapter-html"
                        style={{ fontSize: `${fontSize}px` }}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </div>

                {hasNext && (
                    <div className="nav-button right" onClick={next}>
                        &gt;
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reader;
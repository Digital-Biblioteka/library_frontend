import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./reader.css";
import "./bookmark.css";
import { getLastReadingPos, getToc, postReadingPos, getChapByToc, getChapByIdx } from "./api/readerApi";
import { searchContent } from "./api/contentSearchApi";
import { askBook } from "./api/askBookApi";
import { useBookmarks, BookmarksPanel } from "./Bookmark";
import { IconSearch, IconQuestion } from "./Icons";

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
            <TocItem key={id} item={sub} goToItem={goToItem} level={level + 1} />
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
    const searchHighlightText = state?.searchHighlightText;

    const [html, setHtml] = useState("");
    const [toc, setToc] = useState([]);
    const [tocVis, setTocVis] = useState(false);
    const [progress, setProgress] = useState(0);

    const [spineIdx, setSpineIdx] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);
    const [total, setTotal] = useState(1);

    const [bmVis, setBmVis] = useState(false);
    const [searchVis, setSearchVis] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [askVis, setAskVis] = useState(false);
    const [askQuestion, setAskQuestion] = useState("");
    const [askAnswer, setAskAnswer] = useState(null);
    const [askLoading, setAskLoading] = useState(false);

    const { bookmarks, add: addBookmark, remove: deleteBookmark, update: editBookmark } = useBookmarks(id);

    const [fontSize, setFontSize] = useState(Number(localStorage.getItem("reader-font")) || 18);
    useEffect(() => {
        localStorage.setItem("reader-font", fontSize);
    }, [fontSize]);

    const [theme, setTheme] = useState(
        localStorage.getItem("reader-theme") || "light"
    );
    useEffect(() => {
        localStorage.setItem("reader-theme", theme);
    }, [theme]);

    useEffect(() => {
        if (!containerRef.current) return;

        const blocks = containerRef.current.querySelectorAll(
            "p, td, blockquote"
        );

        blocks.forEach((block, idx) => {
            block.dataset.blockIdx = idx;
            block.classList.add("block-wrapper");
            block.style.position = "relative";

            const exists = bookmarks.find(
                b => b.spine_reference === spineIdx && b.paragraph_index === idx
            );
            // Кнопка закладки
            let btn = block.querySelector(".bookmark-btn-block");
            if (!btn) {
                btn = document.createElement("button");
                btn.className = "bookmark-btn-block";
                block.appendChild(btn);
            }

            if (exists) {
                btn.innerHTML = "★";
                btn.classList.add("active");
            } else {
                btn.innerHTML = "☆";
                btn.classList.remove("active");
            }

            btn.onclick = (e) => {
                e.stopPropagation();

                if (exists) {
                    deleteBookmark(exists.id);
                } else {
                    addBookmark({
                        spineRef: spineIdx,
                        paragraphIdx: idx,
                        text: ""
                    });
                    setBmVis(true);
                }
            };

        });
    }, [html, spineIdx, addBookmark, deleteBookmark, bookmarks]);

    useEffect(() => {
        const global =
            spineIdx / (total-1);
        setProgress(global);
    }, [spineIdx, total, html]);

    const highlightBlock = (block) => {
        block.classList.add('search-highlight-block');
    };

    const clearHighlights = () => {
        const container = containerRef.current;
        if (!container) return;
        container.querySelectorAll('.search-highlight-block').forEach(el => {
            el.classList.remove('search-highlight-block');
        });
        container.removeEventListener('click', clearHighlights);
        container.removeEventListener('wheel', clearHighlights);
        container.removeEventListener('touchstart', clearHighlights);
    };

    const clearHighlightsOnInteraction = () => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('click', clearHighlights, { once: true });
        container.addEventListener('wheel', clearHighlights, { once: true });
        container.addEventListener('touchstart', clearHighlights, { once: true });
    };

    const loadChapter = async (loader) => {
        const chapter = await loader();
        setHtml(chapter.html);
        setSpineIdx(chapter.spineIdx);
        setHasNext(chapter.hasNext);
        setHasPrev(chapter.hasPrev);
        setTotal(chapter.totalSpines);

        spineRef.current = chapter.spineIdx;

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

            //console.log("[Reader] searchChapterIndex=", searchChapterIndex, "searchParagraphIndex=", searchParagraphIndex, "state=", state);

            if (searchChapterIndex != null) {
                startSpine = Number(searchChapterIndex);
            } else {
                const lastPos = await getLastReadingPos(id);
                if (lastPos?.position && lastPos.position !== "0" && lastPos.position !== "NaN") {
                    startSpine = Number(lastPos.position);
                }
            }

            await loadChapter(() => getChapByIdx(id, startSpine));

            if (searchParagraphIndex != null) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const container = containerRef.current;
                        if (!container) return;
                        const block = container.querySelector(
                            `[data-block-idx="${searchParagraphIndex}"]`
                        );
                        if (block) {
                            block.scrollIntoView({ behavior: "smooth", block: "center" });
                            block.classList.add("bookmark-focus");
                            setTimeout(() => block.classList.remove("bookmark-focus"), 1200);

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
        if (hasNext) void loadChapter(() => getChapByIdx(id, spineIdx + 1));
    };
    const prev = () => {
        if (hasPrev) void loadChapter(() => getChapByIdx(id, spineIdx - 1));
    };
    const goToTocItem = (item) => { setTocVis(false); void loadChapter(() => getChapByToc(id, item)); };
    const goToBookmark = async (bookmark) => {
        if (!bookmark) return;

        if (bookmark.spine_reference !== spineIdx) {
            await loadChapter(() => getChapByIdx(id, bookmark.spine_reference));
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const container = containerRef.current;
                if (!container) return;

                const block = container.querySelector(
                    `[data-block-idx="${bookmark.paragraph_index}"]`
                );

                if (!block) {
                    console.warn("Блок не найден", bookmark.paragraph_index);
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

    const handleExit = () => { void saveReadingPos(); navigate(-1); };

    const handleContentSearch = async () => {
        if (!searchQuery.trim() || !id) return;
        try {
            const results = await searchContent(searchQuery, id, 20);
            setSearchResults(results);
        } catch (e) {
            console.error("Ошибка поиска внутри книги", e);
        }
    };

    const handleAskQuestion = async () => {
        if (!askQuestion.trim() || !id) return;
        setAskLoading(true);
        setAskAnswer(null);
        try {
            const resp = await askBook(askQuestion, id, 10);
            setAskAnswer(resp);
        } catch (e) {
            console.error("Ошибка Q&A запроса", e);
            setAskAnswer({ answer: "Не удалось получить ответ.", sources: [] });
        } finally {
            setAskLoading(false);
        }
    };

    const goToSearchResult = async (result) => {
        setSearchVis(false);
        setSearchResults([]);
        setSearchQuery("");

        const targetIdx = result.spineIndex != null && result.spineIndex >= 0 ? result.spineIndex : result.chapterIndex;
        if (targetIdx !== spineIdx) {
            await loadChapter(() => getChapByIdx(id, targetIdx));
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const container = containerRef.current;
                if (!container) return;
                const block = container.querySelector(
                    `[data-block-idx="${result.paragraphIndex}"]`
                );
                if (block) {
                    block.scrollIntoView({ behavior: "smooth", block: "center" });
                    block.classList.add("bookmark-focus");
                    setTimeout(() => block.classList.remove("bookmark-focus"), 1200);
                }
            });
        });
    };

    const goToAskSource = async (source) => {
        setAskVis(false);

        const targetIdx = source.chapter_index;
        if (targetIdx != null && targetIdx !== spineIdx) {
            await loadChapter(() => getChapByIdx(id, targetIdx));
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const container = containerRef.current;
                if (!container) return;
                const block = container.querySelector(
                    `[data-block-idx="${source.paragraph_index}"]`
                );
                if (block) {
                    block.scrollIntoView({ behavior: "smooth", block: "center" });
                    block.classList.add("bookmark-focus");
                    setTimeout(() => block.classList.remove("bookmark-focus"), 1200);
                }
            });
        });
    };

    return (
        <div className="reader-wrapper ">
            <div className="reader-header">
                <div className="header-left">
                    <button className="back-btn" onClick={handleExit}>←</button>
                    <button className="font-btn" onClick={() => setFontSize(f => Math.max(14, f - 2))}>A−</button>
                    <button className="font-btn" onClick={() => setFontSize(f => Math.min(28, f + 2))}>A+</button>
                    <button className="theme-btn" onClick={() => setTheme("light")}>☼</button>
                    <button className="theme-btn" onClick={() => setTheme("dark")}>☽</button>
                    <button className="close-btn" onClick={() => setTocVis(v => !v)}>☰</button>
                    <button className="bookmark-btn" onClick={() => setBmVis(v => !v)}>⚐</button>
                    <button className="search-btn-reader" onClick={() => setSearchVis(v => !v)}><IconSearch size={18} /></button>
                    <button className="ask-btn-reader" onClick={() => setAskVis(v => !v)}><IconQuestion size={18} /></button>
                </div>
                <div className="header-center">{title}</div>
            </div>

            <div className="reader-progress">
                <div
                    className="reader-progress-bar"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>

            {bmVis &&
                <BookmarksPanel
                    bookmarks={bookmarks}
                    onSelect={goToBookmark}
                    onDelete={deleteBookmark}
                    onUpdate={editBookmark} />
            }

            {searchVis && (
                <div className="reader-search-panel">
                    <div className="reader-search-input-row">
                        <input
                            className="reader-search-input"
                            placeholder="Поиск по книге..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleContentSearch()}
                        />
                        <button className="reader-search-go" onClick={handleContentSearch}>Найти</button>
                    </div>
                    {searchResults.length > 0 && (
                        <div className="reader-search-results">
                            {searchResults.map((r, idx) => (
                                <div
                                    key={idx}
                                    className="reader-search-result-item"
                                    onClick={() => goToSearchResult(r)}
                                >
                                    <span className="reader-search-result-chapter">{r.chapter}</span>
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

            {askVis && (
                <div className="reader-ask-panel">
                    <div className="reader-ask-input-row">
                        <input
                            className="reader-ask-input"
                            placeholder="Задайте вопрос по книге..."
                            value={askQuestion}
                            onChange={(e) => setAskQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                        />
                        <button className="reader-ask-go" onClick={handleAskQuestion} disabled={askLoading}>
                            {askLoading ? "..." : "Спросить"}
                        </button>
                    </div>
                    {askLoading && <div className="reader-ask-loading">Поиск ответа...</div>}
                    {askAnswer && !askLoading && (
                        <div className="reader-ask-answer">
                            <div className="reader-ask-answer-text">{askAnswer.answer}</div>
                            {askAnswer.sources && askAnswer.sources.length > 0 && (
                                <div className="reader-ask-sources">
                                    <div className="reader-ask-sources-title">Источники (нажмите на отрывок, чтобы перейти):</div>
                                    {askAnswer.sources.map((s, idx) => (
                                        <div key={idx} className="reader-ask-source-item" onClick={() => goToAskSource(s)}>
                                            <span className="reader-ask-source-chapter">{s.chapter}</span>
                                            <span className="reader-ask-source-snippet">{(s.text_snippet || '').replace(/<\/?em>/g, '')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {tocVis && (
                <div className="toc-panel">
                    {toc.map((item, id) => (
                        <TocItem key={id} item={item} goToItem={goToTocItem} />
                    ))}
                </div>
            )}

            <div className="reader-main">
                { hasPrev && (
                    <div className="nav-button left" onClick={prev}>&lt;</div>
                )}
                <div className={`chapter theme-${theme}`} ref={containerRef}>
                    <article className="chapter-html"
                             style={{ fontSize: `${fontSize}px` }}
                             dangerouslySetInnerHTML={{ __html: html }} />
                </div>
                {hasNext && (
                    <div className="nav-button right" onClick={next}>&gt;</div>
                )}
            </div>
        </div>
    );
};

export default Reader;
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./reader.css";
import "./bookmark.css";
import { getLastReadingPos, getToc, postReadingPos, getChapByToc, getChapByIdx } from "./api/readerApi";
import { useBookmarks, BookmarksPanel } from "./Bookmark";

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

    const [html, setHtml] = useState("");
    const [toc, setToc] = useState([]);
    const [tocVis, setTocVis] = useState(false);
    const [progress, setProgress] = useState(0);

    const [spineIdx, setSpineIdx] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);
    const [total, setTotal] = useState(1);

    const [bmVis, setBmVis] = useState(false);

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

            const lastPos = await getLastReadingPos(id);
            let startSpine = 2;
            if (lastPos?.position && lastPos.position !== "0" && lastPos.position !== "NaN") {
                startSpine = Number(lastPos.position);
            }

            await loadChapter(() => getChapByIdx(id, startSpine));
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

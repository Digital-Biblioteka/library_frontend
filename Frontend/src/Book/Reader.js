import React, { useEffect, useRef, useState } from "react";
import {useLocation, useNavigate} from "react-router-dom";
import "./reader.css"
import {getLastReadingPos, getToc, postReadingPos, getChapByToc, getChapByIdx} from "./api/readerApi";

const TocItem = ({ item, goToItem, level = 0 }) => {
    return (
        <div>
            <div
                className="toc-item"
                style={{ paddingLeft: `${level * 15}px` }}
                onClick={() => goToItem(item)}
            >
                {item.title}
            </div>
            {item.children &&
                item.children.map((sub, id) => (
                    <TocItem key={id} item={sub} goToItem={goToItem} level={level + 1} />
                ))}
        </div>
    );
};

const Reader = () => {
    const containerRef = useRef(null);

    const spineRef = useRef(0);
    const saveTimerRef = useRef(null);


    const { state } = useLocation();
    //const url = state?.url;
    const title = state?.title || "Без названия";
    const id = state?.id;

    const navigate = useNavigate();

    const [html, setHtml] = useState("");
    const [toc, setToc] = useState([]);
    const [tocVis, setTocVis] = useState(false);

    const [spineIdx, setSpineIdx] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);

    const loadChapter = async (loader) => {
        const chapter = await loader();
        console.log(chapter)
        setHtml(chapter.html);
        setSpineIdx(chapter.spineIdx);
        setHasNext(chapter.hasNext);
        setHasPrev(chapter.hasPrev);

        spineRef.current = chapter.spineIdx;

        requestAnimationFrame(() => {
            containerRef.current?.scrollTo({ top: 0 });
        });
    }

    const saveReadingPos = async () => {
        if (!id) return;

        try {
            await postReadingPos(id, {
                spineIdx: spineRef.current
            });
        } catch (e) {
            console.error("Ошибка сохранения позиции", e);
        }
    };

    useEffect(() => {
        if (!id) return;

        saveTimerRef.current = setInterval(() => {
            void saveReadingPos();
        }, 30_000);

        (async () => {
            const tocData = await getToc(id);
            setToc(tocData);

            const lastPos = await getLastReadingPos(id);

            const startSpine =
                lastPos?.spineIdx !== undefined
                    ? lastPos.spineIdx
                    : 0; //при 0 ошибка

            await loadChapter(() => getChapByIdx(id, startSpine));
        })();

        return () => clearInterval(saveTimerRef.current);
    }, [id]);


    const next = () => {
        if (!hasNext) return;
        void loadChapter(() => getChapByIdx(id, spineIdx + 1));
    };

    const prev = () => {
        if (!hasPrev) return;
        void loadChapter(() => getChapByIdx(id, spineIdx - 1));
    };

    const goToTocItem = (item) => {
        setTocVis(false);
        void loadChapter(() => getChapByToc(id, item));
    };

    const handleExit = () => {
        void saveReadingPos();
        navigate(-1);
    };

    return (
        <div className="reader-wrapper">

            <div className="reader-header">
                <div className="header-left">
                    <button className="back-btn" onClick={handleExit}>
                        ←
                    </button>
                    <button className="close-btn" onClick={() => setTocVis((prev) => !prev)}>
                        ☰
                    </button>
                </div>

                <div className="header-center">{title}</div>
            </div>

            {tocVis && (
                <div className="toc-panel">
                    {toc.map((item, id) => (
                        <TocItem key={id} item={item} goToItem={goToTocItem} />
                    ))}
                </div>
            )}
            <div className="reader-main">
                <div className="nav-button left" onClick={prev}>&lt;</div>

                <div className="chapter" ref={containerRef}>
                    <article
                        className="chapter-html"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </div>

                <div className="nav-button right" onClick={next}>&gt;</div>
            </div>
        </div>
    );
};

export default Reader;

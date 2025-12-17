import React, { useEffect, useRef, useState } from "react";
import ePub from "epubjs"
import {useLocation, useNavigate} from "react-router-dom";
import "./reader.css"
import {getLastReadingPos, getToc, postReadingPos} from "./api/readerApi";

const TocItem = ({ item, goToCfi, level = 0 }) => {
    return (
        <div>
            <div
                className="toc-item"
                style={{ paddingLeft: `${level * 15}px` }}
                onClick={() => goToCfi(item.htmlHref)}
            >
                {item.title}
            </div>
            {item.children &&
                item.children.map((sub, id) => (
                    <TocItem key={id} item={sub} goToCfi={goToCfi} level={level + 1} />
                ))}
        </div>
    );
};

const Reader = () => {
    const viewerRef = useRef(null);
    const renditionRef = useRef(null);
    const bookRef = useRef(null);

    const lastCfiRef = useRef(null);
    const saveIntervalRef = useRef(null);

    const { state } = useLocation();
    const url = state?.url;
    const title = state?.title || "Без названия";
    const id = state?.id;

    const navigate = useNavigate();

    const [tocVis, setTocVis] = useState(false);
    const [toc, setToc] = useState([]);

    const savePosition = () => {
        if (!id || !lastCfiRef.current) return;
        void postReadingPos(id, lastCfiRef.current);
     };

    useEffect(() => {
        if (!url || !id) return;

        let cancelled = false;

        const book = ePub(url);
        bookRef.current = book;

        (async () => {
            try {
                await book.ready;
                if (cancelled) return;

                const rendition = book.renderTo(viewerRef.current, {
                     width: "100%",
                     height: "100%",
                     flow: "paginated",
                     spread: "always",
                     minSpreadWidth: 700
                 });

                 renditionRef.current = rendition;

                 if (cancelled) return;

                const tocData = await getToc(id) || [];
                setToc(tocData);
                console.log(tocData)

                const savedPos = await getLastReadingPos(id);

                let startCfi = tocData[0]?.htmlHref;

                if (savedPos?.position) {
                    try {
                        startCfi = JSON.parse(savedPos.position);
                    } catch {
                        startCfi = savedPos.position;
                    }
                }

                await rendition.display(startCfi);

                rendition.on("relocated", (loc) => {
                    lastCfiRef.current = loc.start.cfi;
                });

                saveIntervalRef.current = setInterval(() => {
                    savePosition();
                }, 15000);

            } catch (err) {
                console.error("EPUB load error:", err);
            }
        })();

        return () => {
            cancelled = true;
            clearInterval(saveIntervalRef.current)
            try {
                savePosition();
                renditionRef.current?.destroy();
            } catch {}
        };
// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, id]);


    const next = () => renditionRef.current?.next();
    const prev = () => renditionRef.current?.prev();

    const goToCfi = (cfi) => {
        renditionRef.current?.display(cfi);
        setTocVis(false);
    }

    const handleExit = () => {
        savePosition();
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
                        <TocItem key={id} item={item} goToCfi={goToCfi} />
                    ))}
                </div>
            )}
            <div className="reader-main">
                <div className="nav-button left" onClick={prev}>&lt;</div>

                <div className="reader-container">
                    <div ref={viewerRef} className="reader-view" />
                </div>

                <div className="nav-button right" onClick={next}>&gt;</div>
            </div>
        </div>
    );
};

export default Reader;

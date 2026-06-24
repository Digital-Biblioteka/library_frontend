import React from "react";

function getUserName(request) {
    return request?.user?.userName
        || request?.user?.username
        || request?.user?.email
        || "Пользователь";
}

function getBook(request) {
    return request?.book || {};
}

function getBookTitle(request) {
    const book = getBook(request);
    return book.title || book.name || "Книга";
}

function getBookId(request) {
    const book = getBook(request);
    return book.id || request.bookID || request.bookId;
}

function getCategoryName(request) {
    return request?.category?.name
        || request?.category?.title
        || "Book-set";
}

function getStatus(request) {
    return String(request?.status || "NEW").toUpperCase();
}

function isApproved(request) {
    const status = getStatus(request);
    return status === "APPROVED" || status === "ACCEPTED";
}

function isRejected(request) {
    const status = getStatus(request);
    return status === "REJECTED" || status === "DECLINED";
}

function isInactive(request) {
    return isApproved(request) || isRejected(request);
}

function getGroupBookId(item) {
    return item?.book?.id || item?.bookID || item?.bookId || item?.id;
}

function isBookInGroup(request, groupBooks) {
    const requestedBookId = getBookId(request);

    return groupBooks.some(item => {
        return String(getGroupBookId(item)) === String(requestedBookId);
    });
}

export default function RequestsApprovalModal({
                                                  isOpen,
                                                  title,
                                                  type,
                                                  requests,
                                                  groupBooks = [],
                                                  selectedGroup,
                                                  isLoading,
                                                  onClose,
                                                  onApprove,
                                                  onReject,
                                                  onRequestBookFromAdmin
                                              }) {
    if (!isOpen) return null;

    function handleRequestBookFromAdmin(request) {
        const bookId = getBookId(request);
        const bookTitle = getBookTitle(request);

        const value = window.prompt(
            `Книги "${bookTitle}" нет в книгах группы. Сколько экземпляров запросить у админа?`,
            "1"
        );

        if (value === null) return;

        const requestedLimit = Number(value);

        if (!Number.isInteger(requestedLimit) || requestedLimit <= 0) {
            alert("Лимит должен быть положительным числом");
            return;
        }

        onRequestBookFromAdmin?.({
            groupID: selectedGroup.id,
            bookID: bookId,
            requestedLimit
        });
    }

    return (
        <div className="lib-modal-backdrop" onMouseDown={onClose}>
            <div className="lib-modal lib-modal-wide" onMouseDown={(e) => e.stopPropagation()}>
                <div className="lib-modal-header">
                    <div>
                        <h3>{title}</h3>
                        <p>Check request before approve</p>
                    </div>

                    <button type="button" className="icon-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                {isLoading ? (
                    <div className="state-message">Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="state-message">No requests</div>
                ) : (
                    <div className="requests-list">
                        {requests.map((request) => {
                            const disabled = isInactive(request);

                            const bookRequest = type !== "category";
                            const bookIsInGroup = !bookRequest || isBookInGroup(request, groupBooks);

                            return (
                                <div
                                    className={`request-card ${disabled ? "request-card-disabled" : ""}`}
                                    key={request.id}
                                >
                                    <div>
                                        <div className="request-title">
                                            {type === "category"
                                                ? getCategoryName(request)
                                                : getBookTitle(request)}
                                        </div>

                                        <div className="request-meta">
                                            {getUserName(request)} · статус: {request.status || "NEW"}
                                        </div>

                                        {bookRequest && !bookIsInGroup && !disabled && (
                                            <div className="request-warning">
                                                Этой книги нет в книгах группы. Сначала нужно запросить лимит у админа.
                                            </div>
                                        )}
                                    </div>

                                    <div className="request-actions">
                                            <button
                                                className="delete-btn"
                                                disabled={disabled}
                                                onClick={() => !disabled && onReject(request.id)}
                                            >
                                                Reject
                                            </button>

                                        {bookRequest && !bookIsInGroup && !disabled ? (
                                            <button
                                                className="add-btn"
                                                onClick={() => handleRequestBookFromAdmin(request)}
                                            >
                                                Запросить у админа
                                            </button>
                                        ) : (
                                            <button
                                                className="approve-btn"
                                                disabled={disabled}
                                                onClick={() => !disabled && onApprove(request.id)}
                                            >
                                                {disabled ? "Processed" : "Approve"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
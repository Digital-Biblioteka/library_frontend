import React from "react";

function getUserName(request) {
    return request?.user?.userName || request?.user?.username || request?.user?.email || "Пользователь";
}

function getBookTitle(request) {
    return request?.book?.title || request?.book?.name || "Книга";
}

function getCategoryName(request) {
    return request?.category?.name || request?.category?.title || "Категория";
}

export default function RequestsApprovalModal({
                                                  isOpen,
                                                  title,
                                                  type,
                                                  requests,
                                                  isLoading,
                                                  onClose,
                                                  onApprove,
                                                  onReject
                                              }) {
    if (!isOpen) return null;

    return (
        <div className="lib-modal-backdrop" onMouseDown={onClose}>
            <div className="lib-modal lib-modal-wide" onMouseDown={(e) => e.stopPropagation()}>
                <div className="lib-modal-header">
                    <div>
                        <h3>{title}</h3>
                        <p>Проверьте запрос перед апрувом</p>
                    </div>
                    <button type="button" className="icon-btn" onClick={onClose}>×</button>
                </div>

                {isLoading ? (
                    <div className="state-message">Загружаем запросы...</div>
                ) : requests.length === 0 ? (
                    <div className="state-message">Нет активных запросов</div>
                ) : (
                    <div className="requests-list">
                        {requests.map((request) => (
                            <div className="request-card" key={request.id}>
                                <div>
                                    <div className="request-title">
                                        {type === "category" ? getCategoryName(request) : getBookTitle(request)}
                                    </div>
                                    <div className="request-meta">
                                        {getUserName(request)} · статус: {request.status || "NEW"}
                                    </div>
                                </div>
                                <div className="request-actions">
                                    {type === "category" && (
                                        <button className="danger-btn" onClick={() => onReject(request.id)}>
                                            Отклонить
                                        </button>
                                    )}
                                    <button className="primary-btn" onClick={() => onApprove(request.id)}>
                                        approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

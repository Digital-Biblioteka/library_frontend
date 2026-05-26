import React from "react";

function unwrapUser(userGroup) {
    return userGroup?.user || userGroup;
}

export default function UsersList({ users = [], onShowUserRequests }) {
    return (
        <section className="content-card">
            <div className="section-header">
                <div>
                    <h2>Пользователи группы</h2>
                </div>
            </div>

            <div className="users-layout">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Запросы</th>
                        </tr>
                    </thead>
                    <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="table-empty">В группе пока нет пользователей</td>
                        </tr>
                    ) : (
                        users.map((userGroup) => {
                            const user = unwrapUser(userGroup);
                            return (
                                <tr key={userGroup.id || user.id}>
                                    <td>{user.userName || user.username || "—"}</td>
                                    <td>{user.email || "—"}</td>
                                    <td>
                                        <button className="action-btn" onClick={() => onShowUserRequests?.(user)}>
                                            Show requests
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

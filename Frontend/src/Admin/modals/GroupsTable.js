import React, {useEffect, useState} from "react";
import {getBookLimits} from "../api/adminGroupApi";

export default function GroupsTable({
                                        groups,
                                        onCreate,
                                        onEdit,
                                        onDelete,
                                        onOpenLimits,
                                        onAddUser
                                    }) {

    const [groupLimits, setGroupLimits] = useState([]);

    useEffect(() => {

        async function loadLimits() {

            const result = {};

            for (const group of groups) {
                try {
                    const limits = await getBookLimits(group.id);

                    result[group.id] = limits;
                } catch (e) {
                    console.error("Ошибка загрузки лимитов", e);
                    result[group.id] = [];
                }
            }

            setGroupLimits(result);
        }

        if (groups.length > 0) {
            loadLimits();
        }

    }, [groups]);

    return (
        <div className="users-layout">

            <table className="users-table">

                <thead>
                <tr>
                    <th>GroupName</th>
                    <th>Bibliotekar</th>
                    <th>Description</th>
                    <th>Book Limits</th>
                    <th>
                        <button
                            className="add-btn"
                            onClick={onCreate}
                        >
                            Создать группу
                        </button>
                    </th>
                </tr>
                </thead>

                <tbody>
                {groups.map(group => {
                    const limits = groupLimits[group.id];
                    const hasLimits = limits && limits.length > 0;
                    return(
                        <tr key={group.id}>
                            <td>{group.name}</td>
                            <td>{group.librarian?.username || group.librarian?.userName}</td>
                            <td>{group.description}</td>
                            <td>
                                <button
                                    className="action-btn"
                                    onClick={() => onOpenLimits(group)}
                                >
                                    {hasLimits
                                        ? "Open Limits"
                                        : "Add Limits"}
                                </button>
                            </td>
                            <td>
                                <button
                                    className="action-btn"
                                    onClick={() => onEdit(group)}
                                >
                                    ✎
                                </button>

                                <button
                                    className="action-btn"
                                    onClick={() => onDelete(group.id)}
                                >
                                    🗑
                                </button>

                                <button
                                    className="add-btn"
                                    onClick={() => onAddUser(group)}
                                >
                                    +
                                </button>
                            </td>
                        </tr>
                    )
                })}

                </tbody>

            </table>

        </div>
    );
}

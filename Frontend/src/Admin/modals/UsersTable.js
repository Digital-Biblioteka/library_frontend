import React from "react";
import { getEmail } from "../../Auth/utils/AuthToken";

const roles = [
    { value: "ROLE_USER", label: "USER" },
    { value: "ROLE_ADMIN", label: "ADMIN" },
    { value: "ROLE_LIBRARIAN", label: "BIBLIOTEKAR"}
];

export default function UsersTable({
                                       users,
                                       onCreate,
                                       onEdit,
                                       onDelete
                                   }) {

    return (
        <div className="users-layout">

            <table className="users-table">

                <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>

                    <th>
                        <button
                            className="add-btn"
                            onClick={onCreate}
                        >
                            Create User
                        </button>
                    </th>
                </tr>
                </thead>

                <tbody>

                {users.map(user => {

                    const isCurrentUser = user.email === getEmail();

                    return (
                        <tr key={user.id}>

                            <td>{user.userName}</td>

                            <td>{user.email}</td>

                            <td>
                                {
                                    roles.find(r => r.value === user.role)?.label
                                    || user.role
                                }
                            </td>

                            <td>
                                {isCurrentUser ? (
                                    "this is you"
                                ) : (
                                    <>
                                        <button
                                            className="action-btn"
                                            onClick={() => onEdit(user)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() => onDelete(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}

                            </td>

                        </tr>
                    );
                })}

                </tbody>

            </table>

        </div>
    );
}
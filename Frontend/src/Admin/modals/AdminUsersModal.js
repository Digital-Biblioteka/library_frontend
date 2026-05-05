import React, { useEffect, useState } from "react";
import "./admin-modal-window.css";

import { useFormik } from "formik";
import {
    getAllUsers,
    createUser,
    deleteUser,
    editUser
} from "../api/adminUsersApi";
import Select from "react-select";
import {getEmail} from "../../Auth/utils/AuthToken";

const roles = [
    { value: "ROLE_USER", label: "USER" },
    { value: "ROLE_ADMIN", label: "ADMIN" },
];

const validate = (values) => {
    const errors = {};

    if (!values.userName) errors.username = "Username cannot be empty";
    if (!values.email) errors.email = "Email is required";
    if (!values.role) errors.role = "Choose role";
    if (!values.password && !values.id)
        errors.password = "Password is required";

    return errors;
};

export default function WorkWithUsersModal({ isOpen, onClose }) {
    const [users, setUsers] = useState([]);
    const [mode, setMode] = useState("list"); // list | create | edit
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (isOpen) {
            getAllUsers().then(setUsers);
            console.log(getAllUsers());
            setMode("list");
        }
    }, [isOpen]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: selectedUser?.id || "",
            userName: selectedUser?.userName || "",
            email: selectedUser?.email || "",
            password: "",
            role: selectedUser?.role || ""
        },
        validate,
        onSubmit: async (values, { resetForm }) => {
            try {
                if (mode === "create") {
                    const created = await createUser(JSON.stringify({
                        values
                    }));
                    setUsers(prev => [...prev, created]);
                }

                if (mode === "edit") {
                    await editUser(values.id, values);
                    setUsers(prev =>
                        prev.map(u => u.id === values.id ? { ...u, ...values } : u)
                    );
                }

                resetForm();
                setMode("list");
                setSelectedUser(null);
            } catch (err) {
                console.error(err.message);
            }
        }
    });

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить пользователя?")) return;
        await deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-window" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Управление пользователями</h2>
                    <button className="close-btn" onClick={onClose}> X </button>
                </div>
                {mode === "list" && (
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
                                        onClick={() => {
                                            setSelectedUser(null);
                                            setMode("create");
                                        }}
                                    >
                                        +
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
                                        <td>{user.role}</td>
                                        <td>
                                            {isCurrentUser ? (
                                                "хихи, это ты, чмоня"
                                            ) : (
                                                <>
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            console.log(user);
                                                            setMode("edit");
                                                        }}
                                                    >
                                                        ✎
                                                    </button>
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        🗑
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
                )}

                {(mode === "create" || mode === "edit") && (
                    <form className="modal-form" onSubmit={formik.handleSubmit}>
                        <input
                            type="text"
                            name="userName"
                            placeholder="Username"
                            value={formik.values.userName}
                            onChange={formik.handleChange}
                        />

                        <input
                            type="text"
                            name="email"
                            placeholder="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                        />

                        {(mode === "create") && (
                            <input
                                name="password"
                                placeholder="Password"
                                type="password"
                                onChange={formik.handleChange}
                            />
                        )}

                        <Select
                            options={roles}
                            placeholder="Выберите роль..."
                            value={roles.find((r) => r.value === formik.values.role)}
                            onChange={(option) =>
                                formik.setFieldValue("role", option?.value || "")
                            }
                            classNamePrefix="rs"
                        />

                        <div className="modal-buttons">
                            <button type="submit" className="save-btn">
                                {mode === "create" ? "Создать" : "Сохранить"}
                            </button>
                            <button
                                type="button"
                                className="action-btn"
                                onClick={() => setMode("list")}
                            >
                                Назад
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

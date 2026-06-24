import React, { useEffect, useState } from "react";
import "./admin-modal-window.css";

import {
    getAllUsers,
    deleteUser
} from "../api/adminUsersApi";

import {getAllPrivateBooks} from "../api/adminBookApi";

import UsersTable from "./UsersTable";
import GroupsTable from "./GroupsTable";
import UserFormModal from "./AdminCreateEditUser";
import {getAllGroups} from "../api/adminGroupApi";
import GroupFormModal from "./AdminCreateEditGroups";
import AdminGroupLimitsModal from "./AdminGroupLimitsModal";
import AddUserToGroupModal from "./AddUserToGroupModal";

export default function WorkWithUsersModal({ isOpen, onClose }) {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [mode, setMode] = useState("list"); // list | create | edit
    const [activeTab, setActiveTab] = useState("users"); // users | groups
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isLimitsOpen, setIsLimitsOpen] = useState(false);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [books, setBooks] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadUsers();
            loadGroups();
            loadBooks();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        const data = await getAllUsers();
        setUsers(data);
    };

    const loadGroups = async () => {
        const data = await getAllGroups();
        setGroups(data);
    };

    const loadBooks = async () => {
        const data = await getAllPrivateBooks();
        setBooks(data);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить пользователя?")) return;
        await deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    const handleDeleteGroup = async (id) => {
        if (!window.confirm("Удалить группу?")) return;
        //await deleteGroup(id);
        setGroups(prev => prev.filter(g => g.id !== id));
    };

    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-window" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    {!(mode === "create" || mode === "edit") && (
                        <div className="admin-tabs">
                            <button
                                className={activeTab === "users" ? "tab active" : "tab"}
                                onClick={() => setActiveTab("users")}
                            >
                                Users
                            </button>

                            <button
                                className={activeTab === "groups" ? "tab active" : "tab"}
                                onClick={() => setActiveTab("groups")}
                            >
                                Groups
                            </button>
                        </div>
                    )}
                    <button className="close-btn" onClick={() => mode==='list' ? onClose() : setMode('list')}> X </button>
                </div>
                {mode === "list" && activeTab === "users" && (
                    <UsersTable
                        users={users}
                        onCreate={() => {
                            setSelectedUser(null);
                            setMode("create");
                        }}
                        onEdit={(user) => {
                            setSelectedUser(user);
                            setMode("edit");
                        }}
                        onDelete={handleDelete}
                    />
                )}

                {mode === "list" && activeTab === "groups" && (
                    <GroupsTable
                        groups={groups}
                        onCreate={() => {
                            setSelectedGroup(null);
                            setMode("create");
                        }}

                        onEdit={(group) => {
                            setSelectedGroup(group);
                            setMode("edit");
                        }}

                        onDelete={handleDeleteGroup}
                        onOpenLimits={(group) => {
                            setSelectedGroup(group);
                            setIsLimitsOpen(true);
                        }}
                        onAddUser={(group) => {
                            setSelectedGroup(group);
                            setIsAddUserOpen(true);
                        }}
                    />
                )}

                {(mode === "create" || mode === "edit") && activeTab==='users' && (
                    <UserFormModal
                        mode={mode}
                        selectedUser={selectedUser}
                        onSuccess={() => {
                            loadUsers();
                            setMode("list");
                            setSelectedUser(null);
                        }}
                        onBack={() => setMode("list")}
                    />
                )}

                {(mode === "create" || mode === "edit") && activeTab==='groups' && (
                    <GroupFormModal
                        mode={mode}
                        selectedGroup={selectedGroup}
                        users={users}
                        onSuccess={() => {
                            loadGroups();
                            setMode("list");
                            setSelectedGroup(null);
                        }}
                        onBack={() => setMode("list")}
                    />
                )}

                <AdminGroupLimitsModal
                    isOpen={isLimitsOpen}
                    group={selectedGroup}
                    onClose={() => {
                        setIsLimitsOpen(false);
                        setSelectedGroup(null);
                        loadGroups();
                    }}
                    books={books}
                />

                <AddUserToGroupModal
                    isOpen={isAddUserOpen}
                    group={selectedGroup}
                    onClose={() => {
                        setIsAddUserOpen(false);
                        setSelectedGroup(null);
                    }}
                    onSuccess={loadGroups}
                    users={users}
                />

            </div>
        </div>
    );
}

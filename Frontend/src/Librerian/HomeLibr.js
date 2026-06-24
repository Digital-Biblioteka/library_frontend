import { useEffect, useMemo, useState } from "react";
import { getUsername, logout } from "../Auth/utils/AuthToken";
import "./lib_home.css";

import UsersList from "./UsersList";
import BooksGroupList from "./BookGroupList";
import AddUserToGroupModal from "./AddUserToGroupModal";
import RequestsApprovalModal from './RequestApprovalModal';
import LimitRequestsPanel from "./LimitRequestPanel";
import {
    addUserToGroup,
    approveAccessRequest,
    approveCategoryAccessRequest,
    createLimitRequest,
    createCategoryLimitRequest,
    getAllGroups,
    getAccessRequestsByGroup,
    getLimitRequestsByGroup,
    getAllMyLimitRequest,
    getCategoryAccessRequestsByGroup,
    getCategoryLimitRequestsByGroup,
    getGroupUsers,
    rejectCategoryAccessRequest, getGroupBooksLimits, getAllUsers
} from "./api/librarian-api";

export default function HomeLibr() {
    const username = getUsername();

    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [mode, setMode] = useState("groups");
    const [books, setBooks] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedLimitRequest, setSelectedLimitRequest] = useState(null);

    const [bookRequests, setBookRequests] = useState([]);
    const [categoryRequests, setCategoryRequests] = useState([]);
    const [bookLimitRequests, setBookLimitRequests] = useState([]);
    const [categoryLimitRequests, setCategoryLimitRequests] = useState([]);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [requestsModal, setRequestsModal] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const notificationsCount = useMemo(
        () => bookRequests.length + categoryRequests.length,
        [bookRequests.length, categoryRequests.length]
    );

    useEffect(() => {
        loadGroups();
        loadUsers();

    }, []);

    async function run(action) {
        setIsLoading(true);
        setError("");
        try {
            return await action();
        } catch (e) {
            setError(e.message || "Что-то пошло не так");
            throw e;
        } finally {
            setIsLoading(false);
        }
    }

    async function loadGroups() {
        await run(async () => {
            const data = await getAllGroups();
            setGroups(data || []);
        });
    }

    async function loadUsers() {
        await run(async () => {
            const data = await getAllUsers();
            setAllUsers(data || []);
        });
    }


    async function loadGroupData(group) {
        const [
            usersData,
            bookReq,
            categoryReq,
            bookLimits,
            categoryLimits,
            allBooks] = await Promise.all([
            getGroupUsers(group.id),
            getAccessRequestsByGroup(group.id),
            getCategoryAccessRequestsByGroup(group.id),
            getLimitRequestsByGroup(group.id),
            getCategoryLimitRequestsByGroup(group.id),
            getGroupBooksLimits(group.id)
        ]);

        setUsers(usersData || []);
        setBookRequests(bookReq || []);
        setCategoryRequests(categoryReq || []);
        setBookLimitRequests(bookLimits || []);
        setCategoryLimitRequests(categoryLimits || []);
        setBooks(allBooks || []);

        console.log(allBooks)
    }

    const handleGroupSelect = async (group) => {
        await run(async () => {
            await loadGroupData(group);
            setSelectedGroup(group);
            setMode("users");
        });
    };

    const handleOpenGroupList = () => {
        setSelectedGroup(null);
        setMode("groups");
        setUsers([]);
        setBookRequests([]);
        setCategoryRequests([]);
        setBookLimitRequests([]);
        setCategoryLimitRequests([]);
    };

    const refreshSelectedGroup = async () => {
        if (!selectedGroup) return;
        await loadGroupData(selectedGroup);
    };

    const handleAddUser = async (email) => {
        await run(async () => {
            await addUserToGroup(selectedGroup.id, email);
            await refreshSelectedGroup();
            setIsAddUserOpen(false);
        });
    };

    const approveBookRequest = async (requestId) => {
        await run(async () => {
            await approveAccessRequest(requestId);
            await refreshSelectedGroup();
        });
    };

    const approveCategoryRequest = async (requestId) => {
        await run(async () => {
            await approveCategoryAccessRequest(requestId);
            await refreshSelectedGroup();
        });
    };

    const rejectCategoryRequest = async (requestId) => {
        await run(async () => {
            await rejectCategoryAccessRequest(requestId);
            await refreshSelectedGroup();
        });
    };

    const handleCreateBookLimitRequest = async (payload) => {
        await run(async () => {
            await createLimitRequest(payload);
            await refreshSelectedGroup();
        });
    };

    const handleCreateCategoryLimitRequest = async (payload) => {
        await run(async () => {
            await createCategoryLimitRequest(payload);
            await refreshSelectedGroup();
        });
    };

    const openRequests = (type) => {
        setRequestsModal({
            type,
            title: type === "category" ? "Запросы на доступ к категориям" : "Запросы на доступ к книгам"
        });
    };

    return (
        <div className="Home">
            <div className="home-user">
                <div className="header">
                    <label className="hello-user">Рады вас видеть, {username}</label>

                    <div className="buttons-party">
                        <div className="notif-wrapper">
                            <button className="notification-btn" onClick={() => openRequests("book")}>🕭</button>
                            {notificationsCount > 0 && <span className="notif-badge">{notificationsCount}</span>}
                        </div>
                        <button className="logout-btn" onClick={logout}>Выйти</button>
                    </div>
                </div>

                <main className="panel">
                    {error && <div className="page-error">{error}</div>}

                    {mode === "groups" && (
                        <div className="groups-container">
                            <h2 className="groups-title">Выберите группу</h2>
                            {isLoading ? (
                                <div className="state-message">Загружаем группы...</div>
                            ) : (
                                <div className="groups-grid">
                                    {groups.map((group) => (
                                        <button key={group.id} className="group-card" onClick={() => handleGroupSelect(group)}>
                                            <span className="group-card-name">{group.name}</span>
                                            <span className="group-card-arrow">→</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedGroup && mode !== "groups" && (
                        <>
                            <div className="selected-group-bar">
                                <div>
                                    <strong>{selectedGroup.name}</strong>
                                </div>
                                <div className="lib-actions">
                                    <button className="action-btn" onClick={handleOpenGroupList}>Сменить группу</button>
                                    <button className="add-btn" onClick={() => setMode("users")}>Пользователи</button>
                                    <button className="add-btn" onClick={() => setMode("books")}>Книги группы</button>
                                    <button className="add-btn" onClick={() => setMode("limits")}>Лимиты</button>
                                    <button className="add-btn" onClick={() => setIsAddUserOpen(true)}>Добавить юзера</button>
                                </div>
                            </div>

                            <div className="request-shortcuts">
                                <button className="add-btn" onClick={() => openRequests("book")}>
                                    Запросы книг: {bookRequests.length}
                                </button>
                                <button className="add-btn" onClick={() => openRequests("category")}>
                                    Запросы категорий: {categoryRequests.length}
                                </button>
                            </div>
                        </>
                    )}

                    {mode === "users" && (
                        <UsersList users={users} onShowUserRequests={() => openRequests("book")} />
                    )}

                    {mode === "books" && (
                        <BooksGroupList
                            selectedGroup={selectedGroup}
                            books={books}
                            onClose={() => setMode("users")}
                            onRequestLimit={handleCreateBookLimitRequest}
                        />
                    )}

                    {mode === "limits" && selectedGroup && (
                        <LimitRequestsPanel
                            selectedGroupId={selectedGroup.id}
                            bookLimitRequests={bookLimitRequests}
                            categoryLimitRequests={categoryLimitRequests}
                            onCreateBookLimitRequest={handleCreateBookLimitRequest}
                            onCreateCategoryLimitRequest={handleCreateCategoryLimitRequest}
                            isLoading={isLoading}
                        />
                    )}
                </main>
            </div>

            <AddUserToGroupModal
                isOpen={isAddUserOpen}
                groupName={selectedGroup?.name}
                onClose={() => setIsAddUserOpen(false)}
                onSubmit={handleAddUser}
                isLoading={isLoading}
                users={allUsers}
            />

            <RequestsApprovalModal
                isOpen={Boolean(requestsModal)}
                title={requestsModal?.title}
                type={requestsModal?.type}
                requests={requestsModal?.type === "category" ? categoryRequests : bookRequests}
                isLoading={isLoading}
                onClose={() => setRequestsModal(null)}
                onApprove={approveBookRequest}
                onReject={rejectCategoryRequest}
            />
        </div>
    );
}

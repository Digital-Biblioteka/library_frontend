import React from "react";
import { useFormik } from "formik";
import { addUserToGroup } from "../api/adminGroupApi";
import Select from "react-select";

export default function AddUserToGroupModal({ isOpen, group, onClose, onSuccess, users }) {
    const userOptions = users.map(user => ({
        value: user.email,
        label: user.email
    }));

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: ""
        },
        onSubmit: async (values, { resetForm }) => {
            try {
                await addUserToGroup(group.id, values.email);
                resetForm();
                onSuccess?.();
                onClose?.();
            } catch (e) {
                console.error(e);
            }
        }
    });

    if (!isOpen || !group) return null;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-window" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Добавить пользователя в группу</h2>
                    <button className="close-btn" onClick={onClose}> X </button>
                </div>

                <form className="modal-form" onSubmit={formik.handleSubmit}>
                    <label>{group.name}</label>

                    <Select
                        options={userOptions}
                        placeholder="Выберите email пользователя"
                        onChange={(option) =>
                            formik.setFieldValue("email", option?.value || "")
                        }
                        classNamePrefix="rs"
                        isSearchable={true}
                    />

                    <div className="modal-buttons">
                        <button type="submit" className="save-btn">
                            Добавить
                        </button>

                        <button type="button" className="action-btn" onClick={onClose}>
                            Назад
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

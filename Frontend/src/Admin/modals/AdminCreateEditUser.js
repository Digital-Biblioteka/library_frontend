import React from "react";
import Select from "react-select";
import { useFormik } from "formik";

import {
    createUser,
    editUser
} from "../api/adminUsersApi";

const roles = [
    { value: "ROLE_USER", label: "USER" },
    { value: "ROLE_ADMIN", label: "ADMIN" },
    { value: "ROLE_LIBRARIAN", label: "BIBLIOTEKAR"}
];

const validate = (values) => {

    const errors = {};

    if (!values.userName)
        errors.userName = "Username required";

    if (!values.email)
        errors.email = "Email required";

    if (!values.role)
        errors.role = "Choose role";

    if (!values.password && !values.id)
        errors.password = "Password required";

    return errors;
};

export default function UserFormModal({
                                          mode,
                                          selectedUser,
                                          onSuccess,
                                          onBack
                                      }) {

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

        onSubmit: async (values) => {

            try {

                if (mode === "create") {

                    const { id, ...payload } = values;

                    await createUser(payload);
                }

                if (mode === "edit") {

                    await editUser(values.id, values);
                }

                onSuccess();

            } catch (e) {
                console.error(e);
            }
        }
    });

    return (

        <form
            className="modal-form"
            onSubmit={formik.handleSubmit}
        >

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

            {mode === "create" && (
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={formik.handleChange}
                />
            )}

            <Select
                options={roles}
                placeholder="Choose role"
                defaultValue={formik.values.role}
                onChange={(option) =>
                    formik.setFieldValue("role", option?.value || "" )
                }
                classNamePrefix="rs"
                isSearchable={false}
            />

            <div className="modal-buttons">

                <button type="submit" className="save-btn">
                    {
                        mode === "create"
                            ? "Create"
                            : "Save"
                    }
                </button>

                <button
                    type="button"
                    className="action-btn"
                    onClick={onBack}
                >
                    Back
                </button>

            </div>

        </form>
    );
}
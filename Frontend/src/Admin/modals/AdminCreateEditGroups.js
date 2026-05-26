import React from "react";
import { useFormik } from "formik";
import Select from "react-select";

import {createGroup, upgradeGroup} from "../api/adminGroupApi";

export default function GroupFormModal({
                                           mode,
                                           selectedGroup,
                                           users,
                                           onSuccess,
                                           onBack,
                                       }) {

    const librarianOptions = users
        .filter(user => user.role === "ROLE_LIBRARIAN")
        .map(user => ({
            value: user.id,
            label: `${user.userName} (${user.email})`
        }));

    const formik = useFormik({

        initialValues: {
            librarianID: selectedGroup?.librarianID || "",
            name: selectedGroup?.name || "",
            description: selectedGroup?.description || ""
        },

        onSubmit: async (values) => {

            try {
                if(mode ==="edit"){
                    await upgradeGroup(selectedGroup.id, values);
                }

                if (mode === "create"){
                    await createGroup(values);
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
                name="name"
                placeholder="Название группы"
                value={formik.values.name}
                onChange={formik.handleChange}
            />

            <textarea
                name="description"
                placeholder="Описание"
                value={formik.values.description}
                onChange={formik.handleChange}
            />

            <Select
                options={librarianOptions}
                placeholder="Выберите библиотекаря"
                defaultValue={formik.values.librarianID}
                onChange={(option)=>
                    formik.setFieldValue("librarianID", option?.value)
                }
                isSearchable={false}
            />

            <div className="modal-buttons">

                <button
                    type="submit"
                    className="save-btn"
                >
                    Сохранить
                </button>

                <button
                    type="button"
                    className="action-btn"
                    onClick={onBack}
                >
                    Назад
                </button>

            </div>

        </form>
    );
}
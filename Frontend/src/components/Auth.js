import React from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { signUp, signIn } from "../api/authApi";
import "../style/form.css";

const validate = (values, mode) => {
    const errors = {};

    if (mode === "signup" && !values.Username) {
        errors.Username = "Username cannot be empty";
    }

    if (!values.email) {
        errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = "Invalid email address";
    }

    if (!values.password) {
        errors.password = "Password is required";
    } else if (values.password.length < 8) {
        errors.password = "Password must not be less than 8 characters";
    }

    return errors;
};

function AuthForm({ mode = "signin" }) {
    const navigate = useNavigate();
    const formik = useFormik({
        initialValues: {
            Username: "",
            email: "",
            password: "",
        },

        validate: (values) => validate(values, mode),
        onSubmit: async (values) => {
            try {
                let response;

                if (mode === "signup") {
                    response = await signUp({
                        username: values.Username,
                        email: values.email,
                        password: values.password,
                    });
                } else {
                    response = await signIn({
                        email: values.email,
                        password: values.password,
                    });
                }

                localStorage.setItem("token", response.token);
                console.log("Успешно ура!!")
                navigate("/");
            } catch (err) {
                alert(err.message);
                console.log(err.message)
            }
        },
    });

    return (
        <div className="Page">
            <button className="home-btn" onClick={() => navigate("/")}>
                ↩
            </button>

            <div className="form-container">
                <form onSubmit={formik.handleSubmit}>
                    <h1>{mode === "signup" ? "Sign Up" : "Sign In"}</h1>

                    {mode === "signup" && (
                        <>
                            <input
                                type="text"
                                placeholder="Username"
                                name="Username"
                                id="Username"
                                onChange={formik.handleChange}
                                value={formik.values.Username}
                            />
                            {formik.errors.Username && (
                                <div className="error">{formik.errors.Username}</div>
                            )}
                        </>
                    )}

                    <input
                        type="email"
                        placeholder="Email Address"
                        name="email"
                        id="email"
                        onChange={formik.handleChange}
                        value={formik.values.email}
                    />
                    {formik.errors.email && (
                        <div className="error">{formik.errors.email}</div>
                    )}

                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        id="password"
                        onChange={formik.handleChange}
                        value={formik.values.password}
                    />
                    {formik.errors.password && (
                        <div className="error">{formik.errors.password}</div>
                    )}

                    <button type="submit" className="submit-btn">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AuthForm;

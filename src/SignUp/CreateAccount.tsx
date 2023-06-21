import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { validateCred, validateEmail, validateReqString, handleVisToggle } from "../Shared/helpers";

const CreateAccount: React.FC = function() {
    const [ firstName, setFirstName ] = useState("");
    const [ firstNameErr, setFirstNameErr ] = useState("");
    const [ lastName, setLastName ] = useState("");
    const [ lastNameErr, setLastNameErr ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ emailErr, setEmailErr ] = useState("");
    const [ username, setUsername ] = useState("");
    const [ usernameErr, setUsernameErr ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ passwordErr, setPasswordErr ] = useState("");
    const [ confirmPassword, setConfirmPassword ] = useState("");
    const [ confirmPasswordErr, setConfirmPasswordErr ] = useState("");

    const emailRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target;
        const field = input.getAttribute("id");
        switch (field) {
            case "firstName":
                validateReqString(input, setFirstNameErr);
                setFirstName(input.value);
                break;
            case "lastName":
                validateReqString(input, setLastNameErr);
                setLastName(input.value);
                break;
            case "email":
                validateEmail(input, setEmailErr);
                setEmail(input.value);
                break;
            case "username":
                validateCred(input, setUsernameErr);
                setUsername(input.value);
                break;
            case "password":
                validateCred(input, setPasswordErr);
                if (input.value !== confirmPassword) {
                    setConfirmPasswordErr("Passwords must match.");
                    confirmPasswordRef.current?.setCustomValidity("Passwords must match.");
                } else {
                    setConfirmPasswordErr("");
                    confirmPasswordRef.current?.setCustomValidity("");
                };
                setPassword(input.value);
                break;
            case "confirm-password":
                if (input.value !== password) {
                    setConfirmPasswordErr("Passwords must match.");
                    input.setCustomValidity("Passwords must match.");
                } else {
                    setConfirmPasswordErr("");
                    input.setCustomValidity("");
                };
                setConfirmPassword(input.value);
                break;
        };
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const reqOptions: RequestInit = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ firstName, lastName, email, username, password }),
            credentials: "include"
        };
        try {
            const req = await fetch("http://localhost:3000/users/create-account", reqOptions);
            const message = await req.json();
            if (req.ok) {
                console.log(message);
                navigate("/view-bed");
            } else {
                throw new Error(message);
            };
        } catch(err) {
            console.log(err);
        };
    };

    return (
        <form method="POST" className="signup-form" onSubmit={handleSubmit} noValidate>
            <h2>Create Account</h2>
            <label htmlFor="firstName">First name</label>
            <input type="text" name="firstName" id="firstName" value={firstName} onChange={handleChange} required />
            <p className="err-msg">{firstNameErr}</p>
            <label htmlFor="lastName">Last name</label>
            <input type="text" name="lastName" id="lastName" value={lastName} onChange={handleChange} required />
            <p className="err-msg">{lastNameErr}</p>
            <label htmlFor="email">Email address</label>
            <input ref={emailRef} type="email" name="email" id="email" value={email} onChange={handleChange} required />
            <p className="err-msg">{emailErr}</p>
            <label htmlFor="username">Username</label>
            <input ref={usernameRef} type="text" name="username" id="username" value={username} onChange={handleChange} minLength={7} maxLength={15} required />
            <p className="err-msg">{usernameErr}</p>
            <label htmlFor="password">Password</label>
            <div className="password-field-set">
                <input type="password" name="password" id="password" value={password} onChange={handleChange} minLength={7} maxLength={15} required />
                <button type="button" data-id="password" onClick={handleVisToggle} title="Toggle password visibility">
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg"><path d="M15.815 4.434A9.055 9.055 0 0 0 8 0 9.055 9.055 0 0 0 .185 4.434a1.333 1.333 0 0 0 0 1.354A9.055 9.055 0 0 0 8 10.222c3.33 0 6.25-1.777 7.815-4.434a1.333 1.333 0 0 0 0-1.354ZM8 8.89A3.776 3.776 0 0 1 4.222 5.11 3.776 3.776 0 0 1 8 1.333a3.776 3.776 0 0 1 3.778 3.778A3.776 3.776 0 0 1 8 8.89Zm2.889-3.778a2.889 2.889 0 1 1-5.438-1.36 1.19 1.19 0 1 0 1.19-1.189H6.64a2.889 2.889 0 0 1 4.25 2.549Z" /></svg>
                    <span className="sr-only">Toggle password visibility</span>
                </button>
            </div>
            <p className="err-msg">{passwordErr}</p>
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="password-field-set">
                <input ref={confirmPasswordRef} type="password" name="confirmPassword" id="confirm-password" value={confirmPassword} onChange={handleChange} required />
                <button type="button" data-id="confirm-password" onClick={handleVisToggle} title="Toggle password confirmation visibility">
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg"><path d="M15.815 4.434A9.055 9.055 0 0 0 8 0 9.055 9.055 0 0 0 .185 4.434a1.333 1.333 0 0 0 0 1.354A9.055 9.055 0 0 0 8 10.222c3.33 0 6.25-1.777 7.815-4.434a1.333 1.333 0 0 0 0-1.354ZM8 8.89A3.776 3.776 0 0 1 4.222 5.11 3.776 3.776 0 0 1 8 1.333a3.776 3.776 0 0 1 3.778 3.778A3.776 3.776 0 0 1 8 8.89Zm2.889-3.778a2.889 2.889 0 1 1-5.438-1.36 1.19 1.19 0 1 0 1.19-1.189H6.64a2.889 2.889 0 0 1 4.25 2.549Z" /></svg>
                    <span className="sr-only">Toggle password confirmation visibility</span>
                </button>
            </div>
            <p className="err-msg">{confirmPasswordErr}</p>
            <button type="submit">Sign up</button>
        </form>
    );
};

export default CreateAccount;
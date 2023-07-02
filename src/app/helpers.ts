import { isAlphanumeric, isEmail } from "validator";

// SIGN UP FORM VALIDATIONS
// for strings that are just required
export let validateReqString: (input: HTMLInputElement, msgSetter: React.Dispatch<React.SetStateAction<string>>) => void = function(input, msgSetter) {
    if (input.validity.valueMissing) {
        msgSetter("Field required.");
        input.setCustomValidity("Field required.");
    } else {
        msgSetter("");
        input.setCustomValidity("");
    };
};

export let validateEmail: (input: HTMLInputElement, msgSetter: React.Dispatch<React.SetStateAction<string>>) => void = function(input, msgSetter) {
    if (input.validity.valueMissing) {
        msgSetter("Field required.");
        input.setCustomValidity("Field required.");
        return;
    } else if (!isEmail(input.value)) {
        msgSetter("Please enter a valid email address.");
        input.setCustomValidity("Please enter a valid email address.");
        return;
    } else {
        msgSetter("");
        input.setCustomValidity("");
    };
};

// for username and password
export let validateCred: (input: HTMLInputElement, msgSetter: React.Dispatch<React.SetStateAction<string>>) => void = function(input, msgSetter) {
    if (input.validity.valueMissing) {
        msgSetter("Field required.");
        input.setCustomValidity("Field required.");
        return;
    } else if (!isAlphanumeric(input.value)) {
        msgSetter("May only contain letters and/or numbers.");
        input.setCustomValidity("May may only contain letters and/or numbers.");
        return;
    } else if (input.validity.tooShort) {
        msgSetter("Must be between 7 and 15 characters long.");
        input.setCustomValidity("Username must be between 7 and 15 characters long.");
        return;
    } else {
        msgSetter("");
        input.setCustomValidity("");
    };
};

export function handleVisToggle(e) {
    const fieldId = e.currentTarget.getAttribute("data-id");
    const field = document.querySelector(`#${fieldId}`);
    if (field?.getAttribute("type") === "password") {
        field?.setAttribute("type", "text");
    } else {
        field?.setAttribute("type", "password");
    };
}; 

export function isJWTInvalid(err) {
    let message = "";
    if (err instanceof Error) {
        if (err.message === "JWT blacklisted." || err.message === "JWT is invalid." || err.message === "No JWT found.") message = err.message;
    };
    return message;
};
import { isAlphanumeric, isEmail } from "validator";
import { format } from "date-fns";

/// SIGN UP FORM VALIDATIONS ///
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

/// POST/COMMENT FORM VALIDATIONS ///
export const validatePostInput: (input: HTMLInputElement | null, length: number, msgSetter: React.Dispatch<React.SetStateAction<string>>) => void = function(input, length, msgSetter) {
    if (!input) return;

    if (input.validity.valueMissing) {
        msgSetter("Required.");
        input.setCustomValidity("Required.");
        return;
    } else if (input.validity.tooLong) {
        msgSetter(`Must be no longer than ${length} characters.`);
        input.setCustomValidity(`Must be no longer than ${length} characters.`);
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

export function isJWTInvalid(data: string) {
    if (data === "JWT blacklisted." || data === "JWT is invalid." || data === "No JWT found.") return true;
};

/// DATETIME FORMATTING ///
// used for converting any kind of extended Date object, especially event dates
export function prepEventDateForDisplay(eventDate: Date) {
    if (eventDate) {
        return format(new Date(eventDate), 'MM/dd/yyyy');
    } else {
        return "";
    };
};

// used for RSVP due dates (and potentially repeat till dates) that are formatted like this YYYY-MM-DD
export function prepHyphenatedDateForDisplay(date: Date) {
    if (date) {
        const replacedHyphensDate = new Date(date.toString().replace(/-/g, '/'));
        const mmddyyyyDate = format(new Date(replacedHyphensDate), 'MM/dd/yyyy');
        return mmddyyyyDate;
    };
};

// used for all times
export function convert24to12(time: string) {
    const suffix = Number(time.slice(0, 2)) >= 12 ? "PM" : "AM";
    const hours = ((Number(time.slice(0, 2)) + 11) % 12 + 1);
    const minutes = time.slice(2, 5);
    const timeString = `${hours}${minutes} ${suffix}`;
    return timeString;
};
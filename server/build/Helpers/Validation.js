"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation = (infoObject) => {
    let nameErrormessage = "";
    let emailErrorMessage = "";
    let errorsInPassword = [];
    const nameValidation = (name) => {
        if (name.length === 0)
            nameErrormessage = "Name must not be empty";
    };
    const emailValidation = (email) => {
        const regExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regExp.test(email))
            emailErrorMessage = "this email is incorrect";
    };
    const passwordValidation = (password) => {
        const isNumberInPassword = (pass) => /\d+/.test(pass);
        const isLatinLettersInPassword = (pass) => /[a-z]/.test(pass);
        const isUpperLatinLettersInPassword = (pass) => /[A-Z]/.test(pass);
        const isRussianLettersInPassword = (pass) => /[а-я]/.test(pass);
        const isUpperRussianLettersInPassword = (pass) => /[А-Я]/.test(pass);
        const isNotNumbersAndNotLettersInPassword = (pass) => /\W/.test(pass);
        const isSpacesInPassword = (pass) => /\s/.test(pass);
        const requiredLengthOfPassword = (pass) => pass.length > 7;
        if (!isNumberInPassword(password))
            errorsInPassword.push("Your password must contain numbers!");
        if (!(isLatinLettersInPassword(password) || isRussianLettersInPassword(password)))
            errorsInPassword.push("Your password must contain lower case letters!");
        if (!(isUpperLatinLettersInPassword(password) || isUpperRussianLettersInPassword(password)))
            errorsInPassword.push("Your password must contain upper case letters!");
        if (!isNotNumbersAndNotLettersInPassword(password))
            errorsInPassword.push("Your password must contain special characters (&,%,@,! or other)!");
        if (isSpacesInPassword(password))
            errorsInPassword.push("Your password must not contain spaces!");
        if (!requiredLengthOfPassword(password))
            errorsInPassword.push("length must be more then 7 characters!");
    };
    nameValidation(infoObject.name.trim());
    emailValidation(infoObject.email.trim());
    passwordValidation(infoObject.password.trim());
    if (nameErrormessage === "" && emailErrorMessage === "" && errorsInPassword.length === 0)
        return true;
    else {
        let errorValidationObj = { type: "ErrorValidation", name: nameErrormessage, email: emailErrorMessage, password: errorsInPassword.join(" ") };
        return errorValidationObj;
    }
};
exports.default = validation;
//# sourceMappingURL=Validation.js.map
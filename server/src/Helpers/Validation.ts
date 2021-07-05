import {validationErrorType} from "../types/Types";

const validation = (infoObject: { name: string, email: string, password: string }):true|validationErrorType => {
    let nameErrormessage: string = "";
    let emailErrorMessage: string = "";
    let errorsInPassword: string[] = [];

    const nameValidation = (name: string):void => {
        if (name.length === 0) nameErrormessage = "Name must not be empty";
    };

    const emailValidation = (email: string):void => {
        const regExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regExp.test(email)) emailErrorMessage = "this email is incorrect";
    };

    const passwordValidation = (password: string):void => {

        const isNumberInPassword = (pass: string) => /\d+/.test(pass);
        const isLatinLettersInPassword = (pass: string) => /[a-z]/.test(pass);
        const isUpperLatinLettersInPassword = (pass: string) => /[A-Z]/.test(pass);
        const isRussianLettersInPassword = (pass: string) => /[а-я]/.test(pass);
        const isUpperRussianLettersInPassword = (pass: string) => /[А-Я]/.test(pass);
        const isNotNumbersAndNotLettersInPassword = (pass: string) => /\W/.test(pass);
        const isSpacesInPassword = (pass: string) => /\s/.test(pass);
        const requiredLengthOfPassword = (pass: string) => pass.length > 7;

        if (!isNumberInPassword(password)) errorsInPassword.push("Your password must contain numbers!");
        if (!(isLatinLettersInPassword(password) || isRussianLettersInPassword(password))) errorsInPassword.push("Your password must contain lower case letters!");
        if (!(isUpperLatinLettersInPassword(password) || isUpperRussianLettersInPassword(password))) errorsInPassword.push("Your password must contain upper case letters!");
        if (!isNotNumbersAndNotLettersInPassword(password)) errorsInPassword.push("Your password must contain special characters (&,%,@,! or other)!");
        if (isSpacesInPassword(password)) errorsInPassword.push("Your password must not contain spaces!");
        if (!requiredLengthOfPassword(password)) errorsInPassword.push("length must be more then 7 characters!");
    };

    nameValidation(infoObject.name.trim());
    emailValidation(infoObject.email.trim());
    passwordValidation(infoObject.password.trim());
    if (nameErrormessage === "" && emailErrorMessage === "" && errorsInPassword.length===0) return true;
    else {
        let errorValidationObj:validationErrorType={type:"ErrorValidation", name:nameErrormessage, email:emailErrorMessage, password:errorsInPassword.join(" ")};
        
        return errorValidationObj;
    }
}

    export default validation;
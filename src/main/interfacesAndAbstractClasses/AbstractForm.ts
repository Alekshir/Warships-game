import Game from "../classes/Game/Game";
import helper from "../classes/Helpers/Helpers";
import Spiner from "../classes/Spiner/Spiner";
import { validationErrorType, registerResponseType } from "../types/Types";

class AbstractForm {

    private typeOfForm: "register" | "login";
    private frameElement: HTMLElement;
    private formElement: HTMLFormElement;
    private isNameValidated: boolean = false;//is name field of the form validated or not
    private isEmailValidated: boolean = false;//is email field of the form validated or not
    private isPasswordValidated: boolean = false;//is password field of the form validated or not 
    private openFlag: boolean = false;//is fornm opened or not
    private game: Game; //instance of the Game class
    private spiner: Spiner;//instance of the Spiner class

    /**
     * 
     * @param frameMenuClassName -frame css class name 
     * @param formClassName - form css class name
     * @param typeOfForm - type of form. Login or register
     * @param game - instnce of the Game class
     */
    constructor(frameMenuClassName: string, formClassName: string, typeOfForm: "register" | "login", game: Game) {
        this.spiner = new Spiner();
        this.game = game;
        this.typeOfForm = typeOfForm;
        this.frameElement = document.getElementsByClassName(frameMenuClassName)[0] as HTMLElement;
        this.formElement = document.getElementsByClassName(formClassName)[0] as HTMLFormElement;
        document.addEventListener("keydown", (e) => {// hide on "Escape" button push
            if (e.key === "Escape") this.hide();
        });
        this.frameElement.addEventListener("click", (e) => {//hide on click outside the form
            if (this.frameElement == e.target) this.hide();
        });
        const crossElement = this.formElement.firstElementChild as HTMLElement;
        crossElement.addEventListener("click", () => {// hide on click on the cross element
            this.hide();
        });

        this.addValidatesForInputs();
        this.addEventsToSubbmitButton(typeOfForm);
    }

    /**
     * adds events listeners to subbmit button
     * @param typeofForm -type of form
     */
    private addEventsToSubbmitButton(typeofForm: "register" | "login") {
        const buttonElement = this.formElement.elements.namedItem("button") as HTMLButtonElement;//restorePassword
        const notRememberPswdCheckBox = this.formElement.elements.namedItem("restorePassword") as HTMLInputElement;
        buttonElement.addEventListener("mousedown", (e) => buttonElement.classList.add("registrationMenu__button_pressed"));
        buttonElement.addEventListener("mouseup", (e) => buttonElement.classList.remove("registrationMenu__button_pressed"));
        buttonElement.addEventListener("click", (e) => {
            e.preventDefault();
            [...this.formElement.getElementsByTagName("input")].forEach((input) => {
                //if user did not activate some or all inputs and there are no error text or text from user.
                if (input.value === "") this.validate("", input.name);
            });
            const data = this.getDataForRegistration();
            console.log(data);

            //do not remember password mode
            if (typeofForm === "login" && this.isNameValidated && this.isEmailValidated && notRememberPswdCheckBox.checked) {
                this.spiner.showSpiner();
                const web = `${window.location.protocol}//${window.location.host}`;
                data["web"] = web;
                const fetchRequest = fetch("/restorePassword", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                (helper.promiseWrapperForTimeOut(fetchRequest, 60000) as Promise<Response>).
                    then((res) => res.json()).
                    then((dataResponse: { type: "no such user" | "error" | "ok" }) => {
                        console.log(dataResponse);
                        this.spiner.hideSpiner();
                        switch (dataResponse.type) {
                            case "ok":
                                this.showMessage("instructions to restore your password have been sent to your email").then(_ => {
                                    this.hide();
                                });
                                break;
                            case "no such user":
                                this.showMessage("no such user");
                                break;
                            case "error":
                                this.showMessage("Something went wrong, try again later");
                                break;
                        }
                    }).catch((error)=>{
                        console.log(error);
                        this.showMessage("Something went wrong, try again later");
                    });

                return;
            }

            if (this.isNameValidated && this.isEmailValidated && this.isPasswordValidated) {//if all three fields are validated
                //fetch
                //const data = this.getDataForRegistration();
                const fetchPath = typeofForm === "register" ? "/register" : "/login";
                const method = typeofForm === "register" ? "PUT" : "POST";
                this.spiner.showSpiner();
                const fetchRequest = fetch(fetchPath, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                (helper.promiseWrapperForTimeOut(fetchRequest, 60000) as Promise<Response>).
                    then((res) => res.json()).
                    then((dataResponse: registerResponseType) => {
                        switch (dataResponse.type) {
                            case "ok"://succsesful registration or login
                                this.spiner.hideSpiner();
                                const message = typeofForm === "register" ? "Succsesful registration!" : "You are logged in";
                                this.showMessage(message).then((_) => {
                                    if (typeofForm === "login") {
                                        const userInfoForLS: string = JSON.stringify({ userId: dataResponse.userId, name: data.name });
                                        this.showLoginName(data.name);
                                        localStorage.setItem("warShipUser", userInfoForLS);//save in local storage to use for autologin
                                        this.game.setUserId(dataResponse.userId);
                                        this.game.setUsername(data.name);
                                    }
                                    this.hide();
                                });
                                break;
                            case "ErrorDataBaseOperation":
                                this.spiner.hideSpiner();
                                this.showMessage("Something went wrong try again later!");
                                break;
                            case "duplicateEmail":
                                this.spiner.hideSpiner();
                                this.showMessage("The user with such email registered already");
                                break;
                            case "wrongLogin":
                                this.spiner.hideSpiner();
                                this.showMessage("Your password, email or login is wrong");
                                break;
                            case "ErrorValidation": //At this point by some reason front end validation is missed and back end validation fulfilled. We must set isNameValidated, isEmailValidated, isPasswordValidated to false.
                                this.spiner.hideSpiner();
                                const errorObj = dataResponse as validationErrorType;
                                const nameInput = this.formElement.elements.namedItem("name") as HTMLInputElement;
                                const messageNameError = errorObj.name;
                                messageNameError !== "" ? (this.addErrorMessageToInput(nameInput, true, messageNameError), this.isNameValidated = false) : null;
                                const emailInput: HTMLInputElement = this.formElement.elements.namedItem("email") as HTMLInputElement;
                                const messageEmailError: string = `${data.email}--${errorObj.email}`;
                                messageEmailError !== "" ? (this.addErrorMessageToInput(emailInput, true, messageEmailError), this.isEmailValidated = false) : null;
                                const passwordInputEror: HTMLElement = this.formElement.getElementsByClassName("registrationMenu__passwordError")[0] as HTMLElement;
                                const messagePasswordError: string = errorObj.password;
                                messagePasswordError !== "" ? (this.addErrorMessageToInput(passwordInputEror, false, messagePasswordError), this.isPasswordValidated = false) : null;
                                this.showMessage("Error of form validation!");
                            default:
                                break;
                        }
                    }).catch((error) => {//an error wich was not recognized in previous iterations
                        console.log(error);
                        this.spiner.hideSpiner();
                        this.showMessage("Something went wrong try again later!");

                    });
            } else {//some inputs are not validated
                this.spiner.hideSpiner();
                this.showMessage("Error of form validation!");
            }
        });
    }

    /**
     * show form
     */
    show() {
        if (!this.openFlag) {
            this.openFlag = true;
            this.frameElement.classList.add("regMenuFrame_show"); //open frame
            this.formElement.classList.add("registrationMenu_show");//open form
        }
    }

    /**
     * hide form
     */
    private hide() {
        if (this.openFlag) {
            this.openFlag = false;
            this.formElement.classList.remove("registrationMenu_show");//close form
            this.clearInputs();
            this.isNameValidated = false;//restore field value to initial false
            this.isEmailValidated = false;
            this.isPasswordValidated = false;
            this.formElement.ontransitionend = () => {
                this.frameElement.classList.remove("regMenuFrame_show");//close frame
                this.formElement.ontransitionend = null;
            }
        }
    }

    /**
     * shows message in the form
     * @param text - text of the message 
     * @returns - Promise<"done">
     */
    private showMessage(text: string): Promise<"done"> {
        return new Promise((resolve, reject) => {
            const messageElem = this.formElement.lastElementChild
            messageElem.innerHTML = text;
            messageElem.classList.add("registrationMenu__validationError_show");//show message
            setTimeout(() => {
                messageElem.classList.remove("registrationMenu__validationError_show");//hide message
                resolve("done");
            }, 3000);
        });
    }

    /**
     * show login name in login window
     * @param name 
     */
    private showLoginName(name: string) {
        const loginNameSection = document.getElementsByClassName("loginName")[0];
        loginNameSection.innerHTML = `Logged in as ${name}`;
    }

    /**
     * adds event listeners to inputs to validate input information
     */
    private addValidatesForInputs() {
        //"name input"
        const nameInput = this.formElement.elements.namedItem("name") as HTMLInputElement;
        nameInput.addEventListener("blur", (e) => {// when we leave "name" input then validate this input
            this.validate(nameInput.value, "name");
        });
        nameInput.addEventListener("input", (e) => {//if there was an error in input on "input" event remove red color
            nameInput.classList.remove("input_red");
        });
        //email input
        const emailInput = this.formElement.elements.namedItem("email") as HTMLInputElement;
        const blurHandler = (e: FocusEvent) => {
            this.validate(emailInput.value, "email");
        }
        emailInput.addEventListener("blur", blurHandler);
        emailInput.addEventListener("input", (e) => {
            emailInput.classList.remove("input_red");
        });
        //password input
        const passwordInput = this.formElement.elements.namedItem("password") as HTMLInputElement;
        passwordInput.addEventListener("blur", (e) => {
            this.validate(passwordInput.value, "password");
        });
        passwordInput.addEventListener("input", (e) => {
            passwordInput.classList.remove("input_red");
        });
        passwordInput.addEventListener("focus", (e) => {
            passwordInput.value = "";
            passwordInput.type = "password";
        });
    }

    /**
     * clear all inputs from values and from css error classes
     */
    private clearInputs() {
        [...this.formElement.getElementsByTagName("input")].forEach((input) => input.value = "");
        this.formElement.getElementsByClassName("registrationMenu__passwordError")[0].innerHTML = "";
    }

    /**
     * calls validation function depending on input type
     * @param value - input value
     * @param type - input type
     */
    private validate(value: string, type: string) {
        switch (type) {
            case 'name':
                this.validateName(value);
                break;
            case 'email':
                this.validateEmail(value);
                break;
            case 'password':
                this.validatePassword(value);
        }
    }

    /**
     * validate name
     * @param name 
     */
    private validateName(name: string) {
        const innerText = name.trim();
        if (innerText.length === 0) {
            const elem = this.formElement.elements.namedItem("name") as HTMLInputElement;
            const message = "NAME MUST NOT BE EMPTY";
            this.addErrorMessageToInput(elem, true, message);
            this.isNameValidated = false;
        } else this.isNameValidated = true;
    }

    /**
     * validate email
     * @param email
     */
    private validateEmail(email: string) {
        const regExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regExp.test(email)) {
            const elem = this.formElement.elements.namedItem("email") as HTMLInputElement;
            const message = `${email} this email is incorrect`;
            this.addErrorMessageToInput(elem, true, message);
            this.isEmailValidated = false;
        } else this.isEmailValidated = true;
    }

    /**
     * validate password
     * @param password 
     */
    private validatePassword(password: string) {
        //not less then seven symbolls
        //must contain numbers and letters and special symbols
        /**Your password must contain at least one number digit (ex: 0, 1, 2, 3, etc.) 5) Your password must contain at least one special character -for example: $, #, @, !,%,^,&,*,(,) - mainly the special characters are located on the top row of the keyboard on the same line as the numbers 0 through 9 */
        const regExpSpecialCharacter = /[\$, #, @, !,%,\^,&,\*,\(,\)]+/;
        const regExpNumbers = /\d+/;
        const regExpLettersLatinsUpper = /[A-Z]/;
        const regExpLettersLatin = /[a-z]/;
        const regExpLettersRussianUpper = /[А-Я]/;
        const regExpLettersRussian = /[а-я]/;

        const isNumberInPassword = (pass: string) => /\d+/.test(pass);
        const isLatinLettersInPassword = (pass: string) => /[a-z]/.test(pass);
        const isUpperLatinLettersInPassword = (pass: string) => /[A-Z]/.test(pass);
        const isRussianLettersInPassword = (pass: string) => /[а-я]/.test(pass);
        const isUpperRussianLettersInPassword = (pass: string) => /[А-Я]/.test(pass);
        const isNotNumbersAndNotLettersInPassword = (pass: string) => /\W/.test(pass);
        const isSpacesInPassword = (pass: string) => /\s/.test(pass);
        const requiredLengthOfPassword = (pass: string): boolean => pass.length >= 7;

        const errorsInPassword: string[] = [];

        if (!isNumberInPassword(password)) errorsInPassword.push("Your password must contain numbers!");
        if (!(isLatinLettersInPassword(password) || isRussianLettersInPassword(password))) errorsInPassword.push("Your password must contain lower case letters!");
        if (!(isUpperLatinLettersInPassword(password) || isUpperRussianLettersInPassword(password))) errorsInPassword.push("Your password must contain upper case letters!");
        if (!isNotNumbersAndNotLettersInPassword(password)) errorsInPassword.push("Your password must contain special characters (&,%,@,! or other)!");
        if (isSpacesInPassword(password)) errorsInPassword.push("Your password must not contain spaces!");
        if (!requiredLengthOfPassword(password)) errorsInPassword.push("length must be more then 7 characters!");

        const elem = this.formElement.getElementsByClassName("registrationMenu__passwordError")[0] as HTMLElement;
        if (errorsInPassword.length !== 0) {
            const errorString: string = (this.typeOfForm === "login") ? "Wrong password" : errorsInPassword.join(' ');
            this.addErrorMessageToInput(elem, false, errorString);
            this.isPasswordValidated = false;
        } else {
            elem.innerText = ``;//clear previous error message if it was there
            this.isPasswordValidated = true;
        }
    }

    /**
     * add error message to input
     * @param elem - element to insert error in
     * @param input - is elem input or not
     * @param message 
     */
    private addErrorMessageToInput(elem: HTMLElement | HTMLInputElement, input: boolean, message: string): void {
        if (input) (<HTMLInputElement>elem).value = message;
        else elem.innerText = message;
        elem.classList.add("input_red");
    }

    /**
     * formes object with registration information
     * @returns { name: string, email: string, password: string }
     */
    private getDataForRegistration() {
        const infoObject: { name: string, email: string, password: string } = { name: "", email: "", password: "" };
        [...this.formElement.getElementsByTagName("input")].forEach((input, i) => i < 3 ? infoObject[input.name] = input.value : null);
        return infoObject;
    }
}

export default AbstractForm;
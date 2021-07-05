import Spiner from "../Spiner/Spiner";
import helper from "../Helpers/Helpers";

class RestorePassword {
    private element: HTMLFormElement;
    private userId: string;
    private isPasswordValidated: boolean = false;
    private spiner:Spiner



    constructor() {
        this.element = document.getElementsByTagName("form")[0];
        this.userId = window.location.search.match(/\?user=(.+)&*/)[1];
        this.addListeners();
        this.spiner=new Spiner();
    }

    /**
     * adds listeners to inputs and button
     */
    addListeners() {

        const passwordInput = this.element.getElementsByTagName("input")[0];
        const passwordRepetedInput = this.element.getElementsByTagName("input")[1];
        const button = this.element.getElementsByTagName("button")[0];
        button.disabled = true;

        passwordInput.addEventListener("blur", () => {
            const password = passwordInput.value.trim();
            this.validatePassword(password);
            this.isPasswordValidated ? button.disabled = false : button.disabled = true;
        });


        button.addEventListener("mousedown", () => {
            button.style.boxShadow = "0px 0px 0px";
        });
        button.addEventListener("mouseup", () => {
            button.style.boxShadow = "";
        });

        button.addEventListener("click", (e) => {
            e.preventDefault();

            if (passwordInput.value === passwordRepetedInput.value) {
                this.fetchData({ userId: this.userId, password: passwordInput.value });
            } else {
                //show message your repeated password does not fit first one.
                this.showMessage("repeated password does not match the first password")
            }
        });
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

        const elem = document.getElementsByClassName("errorsInPassword")[0] as HTMLElement;
        if (errorsInPassword.length !== 0) {
            const errorString: string = errorsInPassword.join(' ');
            elem.innerText = errorString;
            this.isPasswordValidated = false;
        } else {
            elem.innerText = ``;//clear previous error message if it was there
            this.isPasswordValidated = true;
        }
    }

    
    /**
     * shows information message
     * @param text 
     * @returns 
     */
    private showMessage(text: string): Promise<"done"> {
        return new Promise((resolve, reject) => {
            const messageElem = this.element.lastElementChild
            messageElem.innerHTML = text;
            messageElem.classList.add("changePassword__message_show");//show message
            setTimeout(() => {
                messageElem.classList.remove("changePassword__message_show");//hide message
                resolve("done");
            }, 3000);
        });
    }

    
    /**
     * fetches data
     * @param data 
     */
    async fetchData(data:{userId:string, password:string}) {
        
        const fetchRequest = fetch("/newPassword", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        
        try{
            this.spiner.showSpiner();
        (helper.promiseWrapperForTimeOut(fetchRequest, 60000) as Promise<Response>).
            then((res) => res.json()).
            then((dataResponse: { type: "ok" | "error no such user" | "error" }) => {
                this.spiner.hideSpiner();
                switch (dataResponse.type) {
                    case "ok":
                        this.showMessage("You password was changed!").then(_=>{
                            this.startNewGame();
                        });
                        break;
                    case "error no such user":
                        this.showMessage("error no such user!");
                        break;
                    case "error":
                        this.showMessage("Something went wrong try again later!");
                        break;
                }
            });
        } catch (error){
            console.log(error);
            this.showMessage("Something went wrong try again later!");
        }
    }

    private startNewGame(){
        const origin=window.location.origin;
        window.location.assign(origin);

    }
}

export default RestorePassword;
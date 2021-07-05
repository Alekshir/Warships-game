class DeleteRegistration {//menu to delete or not registration of the user

    element:HTMLElement;
   
    constructor(){
        this.element=document.getElementsByClassName("deleteRegistrationMenu")[0] as HTMLElement;
    }

    /**
     * open delete registration menu
     */
    open(){
        this.element.parentElement.classList.add("deleteRegistrationMenuWrapper_open");
    }

    /**
     * close delete registration menu
     */
    close(){
        this.element.parentElement.classList.remove("deleteRegistrationMenuWrapper_open");
    }
    
    /**
     * 
     * @returns Promise which resolves witn "yes" if button "yes" clicked or with "no" if button "no" clicked.
     */
    async deleteOrNotDelete():Promise<"yes"|"no">{
        return new Promise((resolve, reject)=>{
            const btnYes=document.getElementsByClassName("deleteRegistrationMenu__btn_yes")[0] as HTMLElement;
            console.log(btnYes);
            btnYes.addEventListener("click", ()=>resolve("yes"));
            const btnNo=document.getElementsByClassName("deleteRegistrationMenu__btn_no")[0] as HTMLElement;
            console.log(btnNo)
            btnNo.addEventListener("click", ()=>resolve("no"));
        });
    }
}

export default DeleteRegistration;
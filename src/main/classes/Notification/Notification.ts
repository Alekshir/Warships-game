class Notification {

    private element: HTMLElement;

    constructor() {
        const element: HTMLElement = document.getElementsByClassName("notificationWrapper")[0] as HTMLElement;
        this.element = element;
    }

    showNotification(message: string) {
        this.element.classList.add("notificationWrapper_open");
        this.element.firstElementChild.classList.add("notification_open");
        (this.element.firstElementChild as HTMLElement).innerHTML = message;
        
        setTimeout(() => {//notification closes after 4 seconds
            this.element.firstElementChild.classList.remove("notification_open");//closes notification
            (this.element.firstElementChild as HTMLElement).ontransitionend = () => {
                this.element.classList.remove("notificationWrapper_open");//closes wrapper(modal window)
                (this.element.firstElementChild as HTMLElement).ontransitionend=null;
            };
        }, 4000);  
    }
}

export default Notification;
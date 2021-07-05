import Game from "../Game/Game";
import Statistics from "../Statistics/Statistics";
import Notification from "../Notification/Notification";
import Spiner from "../Spiner/Spiner";
import DeleteRegistration from "../DeleteRegistration/DeleteRegistration";
import helper from "../Helpers/Helpers"
import { statisticsType, getGamesInfoForReplayResponseType } from "../../types/Types";

class Menu {
    private menuElement: HTMLElement;
    private buttonElement: HTMLElement;
    private game: Game;
    private statistics: Statistics;
    private notification: Notification;
    private spiner: Spiner;
    private deleteRegistrationsMenu: DeleteRegistration;
    private statisticsInfo: statisticsType = null;

    constructor(menuClassName: string, buttonClassName: string, game: Game) {
        this.menuElement = document.getElementsByClassName(menuClassName)[0] as HTMLElement;
        this.buttonElement = document.getElementsByClassName(buttonClassName)[0] as HTMLElement;
        this.game = game;
        this.statistics = new Statistics(game, this);
        this.notification = new Notification();
        this.spiner = new Spiner();
        this.deleteRegistrationsMenu = new DeleteRegistration();
        this.setMenu();
    }

    /**
     * gets all items of the menu and adds event listeners to each item.
     * calls this makeAction with an item as argument.
     * adds event listener for "open/close" button of the menu.
     */
    private setMenu() {
        const menuItems = this.menuElement.children as HTMLCollectionOf<HTMLElement>;
        [...menuItems].forEach((menuItem) => {
            menuItem.addEventListener('mousedown', (e) => {
                e.preventDefault();
                menuItem.classList.add("menu__item_clicked");
            });
            menuItem.addEventListener('mouseup', (e) => {
                e.preventDefault();
                menuItem.classList.remove("menu__item_clicked");
            });
            this.makeAction(menuItem);
        })
        this.buttonElement.addEventListener('click', (e: MouseEvent) => {
            this.menuElement.classList.contains('menu_show') ? this.closeMenu() : this.showMenu();
        });
    }

    /**
     * show menu
     */
    private showMenu() {
        const buttonName: HTMLElement = this.buttonElement.firstElementChild as HTMLElement;
        this.menuElement.classList.add('menu_show');
        buttonName.innerText = 'close';
    }

    /**
     * close menu
     */
    private closeMenu() {
        const buttonName: HTMLElement = this.buttonElement.firstElementChild as HTMLElement;
        this.menuElement.classList.remove('menu_show');
        buttonName.innerText = 'settings';
    }

    /**
     * gets statistics (information) about all played games of the user.
     * @param userId - user id.
     * @returns Promise<{
        statistics: statisticsType | "error" | "no statistics" | "no such user";
        status: "old" | "new";
     */


    /**
     * gets statistics of the user
     * @param userId 
     * @returns Promise
     */
    private async getStatistics(userId: string): Promise<{
        statistics: statisticsType | "error" | "no statistics" | "no such user",
        status: "old" | "new";
    }> {
        if (this.statisticsInfo) { //if the statistics have been fetched allready
            return { statistics: this.statisticsInfo, status: "old" } as { statistics: statisticsType, status: "old" | "new" };
        }

        let gamesStat: statisticsType | "error" | "no statistics" | "no such user";
        const fetchRequest= fetch(`/getGamesInfo?userId=${userId}`, {//transfer user id to the server as parameter of the query string
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        
        await (helper.promiseWrapperForTimeOut(fetchRequest, 60000) as Promise<Response>).then((res) => res.json()).then((dataResponse: getGamesInfoForReplayResponseType) => {
            if (dataResponse.type === "error") gamesStat = "error";
            else if (dataResponse.type === "no statistics") gamesStat = "no statistics";
            else if (dataResponse.type === "no such user") gamesStat = "no such user";
            else {
                gamesStat = dataResponse.statInfo;
                this.statisticsInfo = gamesStat; //save fetched statistics in the class field
            }
        }).catch((error)=>{
            gamesStat = "error";
        });
        return { statistics: gamesStat, status: "new" } as { statistics: statisticsType | "error" | "no statistics" | "no such user", status: "old" | "new" };
    }

    /**
     * shows statistics 
     * @returns Promise<void>
     */
    private async showStatistics(): Promise<void> {
        try{
        this.closeMenu();
        if (!this.game.isLoggedIn()) {//if user is not loggedin
            //show message you are not logged in
            this.notification.showNotification("You are not logged in");
            return;
        }
        const userId: string = this.game.getUserId();
        this.spiner.showSpiner();//shows spiner while fetching is happening 
        const result = await this.getStatistics(userId);
        this.spiner.hideSpiner();
        if (result.statistics === "error") this.notification.showNotification("Something went wrong try again later");
        else if (result.statistics === "no statistics") this.notification.showNotification("no statistics available");
        else if (result.statistics === "no such user") this.notification.showNotification("no statistics available");
        else {
            this.statisticsInfo = result.statistics;
            this.statistics.showStatisticsMenu(result.statistics, result.status);
        }
    } catch(error){
        this.notification.showNotification("Something went wrong try again later");
    };
    
    }

    private async deleteRegistration() {
        try {

            this.closeMenu();
            if (!this.game.isLoggedIn()) {//if user is not loggedin
                //show message you are not logged in
                this.notification.showNotification("You are not logged in");
                return;
            }

            this.deleteRegistrationsMenu.open();
            const yesOrNo = await this.deleteRegistrationsMenu.deleteOrNotDelete();
            if (yesOrNo === "no") {
                this.deleteRegistrationsMenu.close();
                return;
            }
            this.spiner.showSpiner();
            const result = await this.fetchToDelRegistration();
            const resultObj: { type: "no such user" | "error" | "ok" } = await result.json();
            this.spiner.hideSpiner();

            switch (resultObj.type) {
                case "ok":
                    this.game.logOut();
                    await this.showMessage("The user is deleted!");
                    this.deleteRegistrationsMenu.close();

                    break;
                case "no such user":
                    await this.showMessage("no such user!");
                    this.deleteRegistrationsMenu.close();
                    break;
                case "error":
                    await this.showMessage("something went wrong try again later");
                    this.deleteRegistrationsMenu.close();
            }
        } catch (error) {
            this.spiner.hideSpiner();
            await this.showMessage("something went wrong try again later");
            this.deleteRegistrationsMenu.close(); 
        }
    }

    private async fetchToDelRegistration() {
        const userId = this.game.getUserId();
        const fetchRequest = fetch("/deleteUser", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
        });

        return (helper.promiseWrapperForTimeOut(fetchRequest, 60000) as Promise<Response>)
        
    }

    private showMessage(text: string): Promise<"done"> {
        return new Promise((resolve, reject) => {
            const messageElem = document.getElementsByClassName("deleteRegistrationMenu__message")[0];
            messageElem.innerHTML = text;
            messageElem.classList.add("deleteRegistrationMenu__message_show");//show message
            setTimeout(() => {
                messageElem.classList.remove("deleteRegistrationMenu__message_show");//hide message
                resolve("done");
            }, 3000);
        });
    }

    /**
     * adds eventlisteners for click event to menu items which anables items to perfom their functions.
     * @param menuItem - item of the menu
     */
    private makeAction(menuItem: HTMLElement) {
        menuItem.addEventListener("click", () => {
            if (menuItem.classList.contains("menu__item_register")) {
                this.closeMenu();
                if (this.game.isLoggedIn()) {
                    this.notification.showNotification("You are logged in. <br>To register you need to log out.");
                    return;
                }
                this.game.showRegForm();

            } else if (menuItem.classList.contains("menu__item_login")) {
                this.closeMenu();
                if (this.game.isLoggedIn()) {
                    this.notification.showNotification("You are logged in. <br>To log in you need to log out.");
                    return;
                }
                this.game.showLoginForm();

            } else if (menuItem.classList.contains("menu__item_logout")) {
                this.closeMenu();
                this.game.logOut();

            } else if (menuItem.classList.contains("menu__item_statistics")) {
                //send requwst to backend for statistics and then show statistics
                this.showStatistics();
            } else if (menuItem.classList.contains("menu__item_restart")) {
                //restarts game
                this.game.endGame();
            } else if (menuItem.classList.contains("menu__item_delRegistration")) {
                //delete registration
                this.deleteRegistration();

            }
        });
    }

    /**
     * sets statiscs value to this.statisticsInfo. This happens at Game class.
     * @param statistics - object with statiscs information about user results.
     */
    setStatistics(statistics: statisticsType): void {
        this.statisticsInfo = statistics;
    }
}

export default Menu;
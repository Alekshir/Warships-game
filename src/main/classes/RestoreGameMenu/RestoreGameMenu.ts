import Game from "../Game/Game";
import {gameSnapShotToRestore} from "../../types/Types";

class RestoreGameMenu {

    private element: HTMLElement;

    constructor() {
        this.element = document.getElementsByClassName("restoreGameMenuWrapper")[0] as HTMLElement;
        this.open();
        this.element.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("restoreGameMenu__btn_no")) {//if click on "no" button
                this.hide();
                (new Game()).clearGameSnapShot();//start game in normal mode and clear snapshot of the game from LS
            } else if (target.classList.contains("restoreGameMenu__btn_yes")) {//if click on "yes" button
                this.hide();
                const statInfo = localStorage.getItem("restoreGameInfo");
                const statInfoObj = JSON.parse(statInfo) as gameSnapShotToRestore;
                new Game("restore", statInfoObj); //starts game in restore mode
            };
        });
    }

    /**
     * opens restore game menu
     */
    open():void {
        this.element.classList.add("restoreGameMenuWrapper_open");
    }

    /**
     * hides restore game menu
     */
    hide():void {
        this.element.classList.remove("restoreGameMenuWrapper_open");
    }
}

export default RestoreGameMenu;
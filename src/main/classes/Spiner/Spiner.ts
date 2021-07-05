import Game from "../Game/Game";

class Spiner {
    private element:HTMLElement;

    constructor(){
        const element=document.getElementsByClassName("svgClockWrapper")[0] as HTMLElement;
        this.element=element;
    }

    showSpiner(){
        this.element.classList.add("svgClockWrapper_open");
    }

    hideSpiner(){
        this.element.classList.remove("svgClockWrapper_open");
    }

    getElement(){
        return this.element;
    }
}

export default Spiner;
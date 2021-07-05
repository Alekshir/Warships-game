import { replayGameInfoType, statisticsType } from "../../types/Types";
import Game from "../Game/Game";
import helper from "../Helpers/Helpers";
import Menu from "../Menu/Menu";
import Spiner from "../Spiner/Spiner";

class Statistics {

    private element: HTMLElement;
    private openFlag: boolean = false; //opens or not statistics menu
    private game: Game;
    private menu:Menu;
    private spiner:Spiner;

    constructor(game: Game, menu:Menu) {
        this.game = game;
        this.menu=menu;
        this.spiner=new Spiner();
        const element = document.getElementsByClassName("statistics")[0] as HTMLElement;
        this.element = element;
        const closeButton = document.getElementsByClassName("statistics__button")[0] as HTMLElement;
        const tableBookMark = document.getElementsByClassName("statistics__bookmarkTable")[0] as HTMLElement;
        const chartBookMark = document.getElementsByClassName("statistics__bookmarkChart")[0] as HTMLElement;
        const deleteStatBookMark = document.getElementsByClassName("statistics__bookmarkDeleteStatistics")[0] as HTMLElement;
        const statTable = document.getElementsByClassName("table")[0] as HTMLElement;
        const chart = document.getElementsByClassName("chart")[0] as HTMLElement;
        const deleteStatMenu = document.getElementsByClassName("deleteStatMenu")[0] as HTMLElement;
        const delStatMenuYesBtn = document.getElementsByClassName("deleteStatMenu__button_yes")[0] as HTMLElement;
        const delStatMenuNoBtn = document.getElementsByClassName("deleteStatMenu__button_no")[0] as HTMLElement;

        /**
         * makes tables with games active
         */
        const makeStatTableActive = () => {
            statTable.classList.add("table_active");
            tableBookMark.classList.add("statistics__bookmarkTable_active");

            deleteStatMenu.classList.remove("deleteStatMenu_active");
            chart.classList.remove("chart_active");

            chartBookMark.classList.remove("statistics__bookmarkChart_active");
            deleteStatBookMark.classList.remove("statistics__bookmarkDeleteStatistics_active");
        };

        tableBookMark.addEventListener("click", makeStatTableActive);

        /**
         * makes chart active
         */
        const makeChartActive = () => {
            chart.classList.add("chart_active");
            chartBookMark.classList.add("statistics__bookmarkChart_active");

            statTable.classList.remove("table_active");
            deleteStatMenu.classList.remove("deleteStatMenu_active");

            tableBookMark.classList.remove("statistics__bookmarkTable_active");
            deleteStatBookMark.classList.remove("statistics__bookmarkDeleteStatistics_active");
        };

        chartBookMark.addEventListener("click", makeChartActive);

        /**
         * make menu to delete statistics active
         */
        const makeDeleteStatMenuActive = () => {
            deleteStatMenu.classList.add("deleteStatMenu_active");
            deleteStatBookMark.classList.add("statistics__bookmarkDeleteStatistics_active");

            statTable.classList.remove("table_active");
            chart.classList.remove("chart_active");
            tableBookMark.classList.remove("statistics__bookmarkTable_active");
            chartBookMark.classList.remove("statistics__bookmarkChart_active");
        };

        deleteStatBookMark.addEventListener("click", makeDeleteStatMenuActive);

        closeButton.addEventListener("click", (e) => {
            e.preventDefault();
            this.closeStatisticsMenu();
            makeChartActive();
        });
        closeButton.addEventListener("mousedown", () => {
            closeButton.classList.add("statistics__button_pressed");
        });
        closeButton.addEventListener("mouseup", () => {
            closeButton.classList.remove("statistics__button_pressed");
        });

        delStatMenuNoBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.closeStatisticsMenu();
            makeChartActive();
        });

        delStatMenuYesBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.deleteStatisticsOfTheUser(makeChartActive);
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.closeStatisticsMenu();
                makeChartActive();
            }
        });
    }

    /**
     * show statistics menu
     * @param statistics 
     * @param status 
     */
    showStatisticsMenu(statistics: statisticsType, status: "new" | "old"): void {
        this.openFlag = true;
        if (status === "new") {//if we need refresf statistics
            const victories: number = statistics.victories;
            const defeats: number = statistics.defeats;
            this.createChart(defeats, victories);
            this.createTable(statistics.gamesToReplayArray);
        }
        this.element.classList.add("statistics_open");
    }

    /**
     * close statistics menu
     */
    private closeStatisticsMenu(): void {
        if (this.openFlag) {
            this.openFlag = false;
            this.element.classList.remove("statistics_open");
        }
    }
    
    /**
     * create chart
     * @param defeats 
     * @param victories 
     */
    private createChart(defeats: number, victories: number) {
        const rotateElem = document.getElementsByClassName("chart__diagramSecondElem")[0] as HTMLElement;
        const thirdElemOfDiagram = document.getElementsByClassName("chart__diagramThirdElem")[0] as HTMLElement;
        const firstElemOfDiagram = document.getElementsByClassName("chart__diagramFirstElem")[0] as HTMLElement;
        const secondElemOfDiagram = document.getElementsByClassName("chart__diagramSecondElem")[0] as HTMLElement;
        const diagramLegendVictories = document.getElementsByClassName("chart__victories")[0] as HTMLElement;
        const diagramLegendDefeats = document.getElementsByClassName("chart__defeats")[0] as HTMLElement;
        //const ratio=victories/defeats;
        //const victoriesAngel: number = (360*ratio)/(1+ratio);
        //const defeatsAngel:number=360-victoriesAngel;
        const ratioVictories: number = victories / (victories + defeats);
        //const ratioDefeats:number=1-ratioVictories;
        const victoriesAngel: number = ratioVictories * 360;
        const defeatsAngel: number = 360 - victoriesAngel;
        diagramLegendVictories.innerHTML = `<div>victories ${victories} (${Math.round(ratioVictories * 100)}%)</div>`;
        diagramLegendDefeats.innerHTML = `<div>defeats ${defeats} (${100 - Math.round(ratioVictories * 100)}%)</div>`;
        if (victories <= defeats) {
            rotateElem.style.transform = `rotate(${victoriesAngel}deg)`;
        } else {
            thirdElemOfDiagram.classList.add("chart__diagramThirdElem_anotherColor");
            firstElemOfDiagram.classList.add("chart__diagramFirstElem_anotherColor");
            secondElemOfDiagram.classList.add("chart__diagramSecondElem_anotherColor");
            rotateElem.style.transform = `rotate(${defeatsAngel}deg)`;
        }
    }

    /**
     * createtables with played games
     * @param gamesInfo 
     */
    private createTable(gamesInfo: replayGameInfoType[]) {
        const docFragement = new DocumentFragment();
        const statTable = document.getElementsByClassName("table")[0];
        const templateRow = document.getElementById("templateRow") as HTMLTemplateElement;
        let cloneRow = templateRow.content.cloneNode(true) as DocumentFragment;
        const templateButton = document.getElementById("btnReplayGame") as HTMLTemplateElement;
        statTable.innerHTML = "";
        docFragement.appendChild(cloneRow);
        gamesInfo.forEach((gameInfo) => {
            cloneRow = templateRow.content.cloneNode(true) as DocumentFragment;
            const columns = cloneRow.firstElementChild.children as HTMLCollectionOf<HTMLElement>;
            const cloneButton = templateButton.content.cloneNode(true) as DocumentFragment;
            cloneButton.firstElementChild.addEventListener('click', () => {
                this.game.replay(gameInfo);
            });
            columns[0].innerText = gameInfo.date;
            columns[1].innerText = gameInfo.duaration;
            columns[2].innerText = gameInfo.result;
            columns[3].innerText = String(gameInfo.moves.length);
            columns[4].innerText = "";
            columns[4].appendChild(cloneButton);
            docFragement.appendChild(cloneRow);
        });
        statTable.appendChild(docFragement);
    }

    /**
     * delete statistics of the user
     * @param makeChartActive -function makes chart active
     */
    deleteStatisticsOfTheUser(makeChartActive:()=>void) {
        const userId = this.game.getUserId();
        const fetchRequest = fetch("/deleteStatistics", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
        });

        this.spiner.showSpiner();

        (helper.promiseWrapperForTimeOut(fetchRequest, 60000) as Promise<Response>).
            then((res) => res.json()).
            then((dataResponse: { type: "no such user" | "error" | "ok" }) => {
                this.spiner.hideSpiner();
                switch (dataResponse.type) {
                    case "ok":
                        console.log("ok");
                        this.menu.setStatistics(null);//clear cashed statistics
                        //show message statistics deleted
                        this.showMessage("the Users's statistics deleted!").then(_=>{
                            this.closeStatisticsMenu();
                            makeChartActive();
                        });
                        break;
                    case "no such user":
                        console.log("no such user");
                        //show message no such user
                        this.showMessage("No such user!").then(_=>{
                            this.closeStatisticsMenu();
                            makeChartActive();
                        });
                        break;
                    case "error":
                        console.log("something went wrong try again later")
                    //show mesage something went wrong try again later
                    this.showMessage("something went wrong try again later!").then(_=>{
                        this.closeStatisticsMenu();
                        makeChartActive();
                    });
                }
            }).catch(error=>{
                console.log(error);
                //show message something went wrong try again later
                this.showMessage("something went wrong try again later!").then(_=>{
                    this.closeStatisticsMenu();
                     makeChartActive();
                    });
            });      
    }

    /**
     * shows message
     * @param text 
     * @returns 
     */
    private showMessage(text: string):Promise<"done"> {
        return new Promise((resolve, reject) => {
            const messageElem = document.getElementsByClassName("deleteStatMenu__message")[0];
            messageElem.innerHTML = text;
            messageElem.classList.add("deleteStatMenu__message_show");//show message
            setTimeout(() => {
                messageElem.classList.remove("deleteStatMenu__message_show");//hide message
                resolve("done");
            }, 3000);
        });
    }
}
    export default Statistics;
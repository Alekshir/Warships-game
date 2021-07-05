import Board from "../Board/Board";
import Ship from "../Ship/Ship";
import helper from "../Helpers/Helpers";
import Enum from "../Enum/Enum";
import Timer from "../Timer/Timer";
import Menu from "../Menu/Menu";
import RegistrationForm from "../RegisterForm/RegisterForm";
import LoginForm from "../LoginForm/LoginForm";
import Notification from "../Notification/Notification";
import { userInfoFromLSType, replayRestoreAggeregateShipsPositionsType, replayMovesType, replayGameInfoType, replayRestoreShipsPositions, statisticsToSaveType, statisticsToSaveResponseType, computerBoardEvent, playerBoardEvent, gameSnapShotToRestore, cellsStatesForRestore } from "../../types/Types";
import { TimerInterface } from "../../interfacesAndAbstractClasses/TimerInterface";

class Game {

    private gameState = Enum.getGameStateEnum();
    private msgs = Enum.getMesssagesEnum();
    private state = this.gameState.animation;
    private playerBoard: Board;
    private computerBoard: Board;
    private timer: TimerInterface;
    private regForm: RegistrationForm;
    private loginForm: LoginForm;
    private menu: Menu;
    private notification: Notification;
    private userName: string | null = null;
    private userId: string | null = null;
    private mode: "replay" | "restore" = null;
    private replayMoveArray: { row: number, column: number }[] = [];
    private replayCounterMoves: number = 0;
    private sliderState: 1 | 2 = 1;
    private complexLastHitsCoord: { row: number, column: number }[][] = [];
    private currentMessage: string;

    /**
     * 
     * @param mode -optinal. Set game to replay mode. Programe replays old game.
     * @param gameInfo - object of replayGameInfoType. Iformation which is needed to replay game.
     */
    constructor(mode?: "replay" | "restore", gameInfo?: replayGameInfoType | gameSnapShotToRestore) {
        let shipsPositions: replayRestoreAggeregateShipsPositionsType = null;
        let computerBoardShipsPositions: replayRestoreShipsPositions = null;
        let playerBoardShipsPositions: replayRestoreShipsPositions = null;
        let computerBoardCells: cellsStatesForRestore = null;
        let playerBoardCells: cellsStatesForRestore = null;
        this.autoLogIn();

        if (mode === "replay") {// if replay mode 
            this.mode = "replay";
            this.clearSessionStorage();//clear sesion storage which we used to detect that replay mode is on.
            this.replayMoveArray = (<replayGameInfoType>gameInfo).moves;//moves wich will be replayed
            shipsPositions = (<replayGameInfoType>gameInfo).positionOfShips;//positionsOfShips
            computerBoardShipsPositions = shipsPositions.computerBoard;
            playerBoardShipsPositions = shipsPositions.playerBoard;
        } else if (mode === "restore") {
            this.mode = "restore";
            computerBoardShipsPositions = (<gameSnapShotToRestore>gameInfo).computerBoardShips;
            playerBoardShipsPositions = (<gameSnapShotToRestore>gameInfo).playerBoardShips;
            computerBoardCells = (<gameSnapShotToRestore>gameInfo).computerBoardCells;
            playerBoardCells = (<gameSnapShotToRestore>gameInfo).playerBoardCells;
            this.complexLastHitsCoord = (<gameSnapShotToRestore>gameInfo).computerHits;
            this.replayMoveArray=(<gameSnapShotToRestore>gameInfo).arrayOfMoves;
        } else mode = null;

        let playerBoardElement = document.getElementById('playerBoard');
        let computerBoardElement = document.getElementById('computerBoard');

        this.regForm = new RegistrationForm("regMenuFrame", "registrationMenu", "register", this);
        this.loginForm = new LoginForm("regMenuFrame", "registrationMenu_login", "login", this);
        this.computerBoard = new Board(computerBoardElement, ['cell', 'cell_notBombed'], ['animationExplosion'], ['ship'], false, mode, computerBoardShipsPositions, computerBoardCells, this);
        this.playerBoard = new Board(playerBoardElement, ['cell', 'cell_notBombed'], ['animationExplosion'], ['ship'], true, mode, playerBoardShipsPositions, playerBoardCells, this);
        this.menu = new Menu("menu", "button", this);
        this.notification = new Notification();

        this.fitBoardsWidth();//if board is in skewX mode, prevent its edges from ovelap the screen.
        this.onWindowResize();//calls fitBoardsWidth on window resize

        let svgLetters = document.getElementById('svgLetter') as unknown as SVGElement;
        helper.animateSvgLetters(svgLetters).then((_) => {//show animated message at the start of the game.
            if (this.mode !== "replay" && this.mode !== "restore") {
                this.computerBoard.randomize(); //randomizes position of ships on computerBoard
                this.playerBoard.randomize(); //randomizes position of ships on playerBoard
            }
            //sets property dragAndDropEnabled of the playerBoard to true
            if (this.mode !== "restore") {
                this.updateStatus(this.msgs.gameStart);//show message at the start of the game
                this.playerBoard.dragAndDropEnabled = true;//let to drag ships
                this.rotateCubeFirstMove();//show cube message "your move"
                this.state = this.gameState.begin;
            }
            if (this.mode === "replay") {//if replay mode then any click on the computer board starts the new game.
                this.computerBoard.getElement().addEventListener("click", () => this.endGame())
                this.replayMoves();
            }

            if (this.mode == "restore") {
                this.state = (<gameSnapShotToRestore>gameInfo).stateOfGame;

                if (this.state === Enum.getGameStateEnum().computerTurn) {//if computer turn
                    this.rotateCubeFirstMove();
                    this.computersTurn();
                } else {//player turn
                    this.computerBoard.setPlayerTurn(true);
                    this.rotateCubeFirstMove();
                }
            }
        });

        let initialTime = gameInfo && ("time" in gameInfo) ? (<gameSnapShotToRestore>gameInfo).time : null;//get time in restore mode.
        this.timer = new Timer();
        this.timer.startTimer(initialTime); //starts timer
    }


    /**
     * callback function 'onEvent' for computerBoard
     * @param evt -computerBoardEvent
     * @param move - Optional argument, is not needed in "replay mode". Coordinates of move. In order to save in statistics of the game to replay in the future.
     * @param infoObj -object contains cell HTMLElement which was clicked or instance of Ship class which was clicked
     */
    onComputerBoardEvent = (evt: computerBoardEvent, move?: { row: number, column: number }, infoObj?: { target?: HTMLElement, ship?: Ship }) => {
        //save ifo about game in local storage
        //this.mode !== "replay" ? this.saveGameSnapShot() : null;
        switch (evt) {
            case 'click': // The user clicked on the computer board
                switch (this.state) {
                    case this.gameState.begin: //if this is the start of the game then starts the game
                        this.startGame(infoObj.target);
                        break;
                    case this.gameState.computerTurn:  // Not user turn yet.  Ask to wait.
                        this.updateStatus(this.msgs.wait);
                        break;
                    case this.gameState.playerTurn://bomb 
                        this.computerBoard.bombCell(infoObj.target);
                        break;
                    case this.gameState.finished: // Start a new game
                        this.computerBoard.randomize();
                        this.computerBoard.hideAllShips();
                        this.playerBoard.randomize();
                        this.playerBoard.dragAndDropEnabled = true;
                        this.updateStatus(this.msgs.gameStart);
                        this.state = this.gameState.begin;
                        break;
                }
                break;
            case 'playerMissed': //player missed
                this.computersTurn();//computer make move
                //push move to temp array to save in statistics
                if (this.mode !== "replay") this.replayMoveArray.push(move), this.saveGameSnapShot();
                break;
            case 'hit': //hit a ship
                this.updateStatus(this.msgs.enemyShipHit, infoObj.ship);
                this.computersTurn();
                //push move to temp array
                if (this.mode !== "replay") this.replayMoveArray.push(move), this.saveGameSnapShot();
                break;
            case 'shipSunk': //ship is sunk
                this.computerBoard.showShip(infoObj.ship);
                this.updateStatus(this.msgs.shipSunk);
                this.computersTurn();
                //push move to temp array
                if (this.mode !== "replay") this.replayMoveArray.push(move), this.saveGameSnapShot();
                break;
            case 'allSunk': //all ships are sunk
                //push move to temp array
                if (this.mode !== "replay" && this.userId) {//not replay mode and user loggedin
                    this.replayMoveArray.push(move);
                    this.saveGameInfoForReplay(this.userId, "victory");//save game information to replay in the future
                    this.clearGameSnapShot();
                }
                this.computerBoard.showShip(infoObj.ship);//show the ship which is sunk
                this.playerBoard.showRestOfTheShips();//show all ships on the computer board
                this.state = this.gameState.finished;
                this.timer.stopTimer();
                this.computerBoard.setPlayerTurn(false);
                this.updateStatus(this.msgs.allSunk);
                /*if (helper.isMobileMode())*/ this.notification.showNotification("Congratulations! Victory!");//show only in mobile mode
                break;
        }
    }

    /**
     * 
     * @param evt -object of playerBoardEvent
     * @param move -object with coordinates of the bomb.
     * @param ship - instance of Ship class
     */
    onPlayerBoardEvent = (evt: playerBoardEvent, move: { row: number, column: number }, ship?: Ship) => {
        //save ifo about game in local storage
       // this.mode !== "replay" ? this.saveGameSnapShot() : null;
        switch (evt) {
            case 'playerMissed'://computer missed
                this.computerBoard.setPlayerTurn(true);//player turn
                this.state = this.gameState.playerTurn; // programme uses state in onComputerBoardEvent in logic how to react on click
                //if replayMode call replay with coordinates from array of moves
                if (this.mode === "replay") {
                    this.bombBoardInReplayMode("computer");
                } else this.replayMoveArray.push(move) , this.saveGameSnapShot();
                break;
            case 'hit': //computer hit a ship
                this.updateStatus(this.msgs.yourShipHit, ship);//show message that the ship is hit
                this.computerBoard.setPlayerTurn(true);//player turn
                this.state = this.gameState.playerTurn;
                //if replayMode call replay with coordinates from array of moves (This is as if a player click on the computer board)
                if (this.mode === "replay") this.bombBoardInReplayMode("computer");
                else this.replayMoveArray.push(move), this.saveGameSnapShot();//if in normal mode, push move to this.replayMoveArray to save statistics at the end of the game.
                break;
            case 'shipSunk'://ship is sunk
                this.updateStatus(this.msgs.lostShip);//show message that the ship is sunk
                this.computerBoard.setPlayerTurn(true);//player turn
                this.state = this.gameState.playerTurn;
                //if replayMode call replay with coordinates from array of moves
                if (this.mode === "replay") this.bombBoardInReplayMode("computer");
                else this.replayMoveArray.push(move), this.saveGameSnapShot();
                break;
            case 'allSunk'://all ships are sunk
                if (this.mode !== "replay") {
                    this.clearGameSnapShot();
                    if (this.userId) {
                        this.replayMoveArray.push(move);
                        this.saveGameInfoForReplay(this.userId, "defeat");
                    }
                }
                this.updateStatus(this.msgs.lostGame);//show message about defeat
                /*if (helper.isMobileMode())*/ this.notification.showNotification("You lost this game.");//in mobile mode show additional notification
                this.computerBoard.setPlayerTurn(false);
                this.computerBoard.showRestOfTheShips();
                this.state = this.gameState.finished;
                this.timer.stopTimer();
                //push move to temp array

                break;
        }
    }

    /**
     * computer makes its move
     */
    private computersTurn() {
        this.computerBoard.setPlayerTurn(false);//computer board will react on plaer clicks with message "wait your turn"
        this.state = this.gameState.computerTurn;//sets game state in computer turn. Programe use state in onComputerBoardEvent on click event
        this.playerBoard.timerComputerThinkingStart();//start counting time of computer thinking
        if (this.mode !== "replay") this.playerBoard.spiner.showSpiner();
        setTimeout(() => {
            if (this.mode === "replay") this.bombBoardInReplayMode("player");
            else this.playerBoard.chooseMove(); //May be this.computerBoard.chooseMove() ? Not because we use player board to navigate our bomb.
        }, 5000);//delay to imitate computer thinking
    }

    /**
     * starts game when user click for the first time on the computer board
     * @param target - cell HTMLElement the user clicked on.
     */
    private startGame(target: HTMLElement) {
        if (this.playerBoard.boardIsValid()) {//checks if user positioned ships in valid places.
            this.state = this.gameState.playerTurn; //sets state as player turn
            this.playerBoard.dragAndDropEnabled = false; //switch off opportunity to drag and drop ships
            this.computerBoard.setPlayerTurn(true);
            this.updateStatus(this.msgs.gameOn);//show message "game started"
            this.computerBoard.bombCell(target); //bomb computer board at the clicked cell
        }
        else this.updateStatus(this.msgs.invalidPositions); //show message that ships are in invalid positions
    }

    /**
     * show messages in slider
     * @param text - text of the message
     * @param ship - instance of Ship class
     */
    private updateStatus(text: string, ship?: Ship) {
        this.currentMessage = text;
        let hitsNumberMessage: string = '';
        if (ship) {//ship appears as argument when was hit
            hitsNumberMessage = ship.getHits() === 1 ? `<br>${Enum.getShipHitsMessages()[0]}` ://gets number of hits of the ship
                ship.getHits() === 2 ? `<br>${Enum.getShipHitsMessages()[1]}` :
                    ship.getHits() === 3 ? `<br>${Enum.getShipHitsMessages()[2]}` :
                        ship.getHits() === 4 ? `<br>${Enum.getShipHitsMessages()[3]}` :
                            `<br>${Enum.getShipHitsMessages()[4]}`;
        }
        text = `${text}${hitsNumberMessage}`;
        const slider = document.getElementsByClassName('status')[0] as HTMLElement;
        const emptyFrame = document.getElementsByClassName('emptyFrame')[0] as HTMLElement;
        const width: number = emptyFrame.offsetHeight;
        if (this.sliderState === 1) {//state one
            emptyFrame.innerHTML = text;
            slider.style.marginTop = `-${width}px`;//slider slides up
            slider.ontransitionend = () => {
                this.sliderState = 2;//on end of sliding up chage state to two
                slider.ontransitionend = null;//clear ontransitionend
            }
        }

        if (this.sliderState === 2) {//state two slider is up by 50%
            slider.style.marginTop = `-2${width}px`;//slider goes up by another 50% 
            slider.ontransitionend = function () {//on end of movement
                slider.style.transitionDuration = '1ms';//sets minimum transition duaration
                emptyFrame.innerText = ''; //clear previous message
                slider.style.marginTop = '0px';//in 1ms scroll slider in initial position
                slider.ontransitionend = function () {//at the end of scroll
                    slider.style.transitionDuration = '0.5s';//set trantion duaration to 0.5 seconds
                    emptyFrame.innerHTML = text;//enter text
                    slider.style.marginTop = `-${width}px`;//slide up
                    slider.ontransitionend = null;//clear ontransionend handler
                }
            }
        }
    }

    /**
     * on window resize fit edges of the boards, when in skew mode they ovelap viewport.
     * using throttle
     */
    private onWindowResize() {

        /**
         * 
         * @param func - function to throttle
         * @param ms  - throttle interval
         * @returns -void
         */
        function throttle(func, ms): () => void {

            let isThrottled: boolean = false, savedArgs: IArguments, savedThis;

            function wrapper() {

                if (isThrottled) { // (2)
                    savedArgs = arguments;
                    savedThis = this;
                    return;
                }
                func.apply(this, arguments); // (1)

                isThrottled = true;

                setTimeout(function () {
                    isThrottled = false; // (3)
                    if (savedArgs) {

                        wrapper.apply(savedThis, savedArgs);
                        savedArgs = savedThis = null;
                    }
                }, ms);
            }

            return wrapper;
        }
        const wrapperfitBoardsWidth = throttle(this.fitBoardsWidth, 500);//throttled this.fitBoardsWidth method

        window.onresize = (event: UIEvent) => {//add throttled method as "resize" event handler.
            wrapperfitBoardsWidth();
        }
    }

    /**
     * fits edges fo the boards accordind with the size of the view port. If in skewX mode this edges are out of the window.
     */
    private fitBoardsWidth(): void {
        let computerBoardElem = document.getElementsByClassName('board')[0] as HTMLElement;
        let playerBoardElem = document.getElementsByClassName('board')[1] as HTMLElement;
        computerBoardElem.style.width = '';
        playerBoardElem.style.width = '';
        let coordAndSizeofCompBoard: DOMRect = computerBoardElem.getBoundingClientRect();

        let leftTopEdge = coordAndSizeofCompBoard.x;
        if (leftTopEdge < 0) {//if left top edge goes out of the viewport
            let widhCorrection = -leftTopEdge - window.pageXOffset + 'px';//do we really need window.pageXOffset?
            computerBoardElem.style.width = `calc(47% - ${widhCorrection})`;//decrease width of the board by the value of the correction
            playerBoardElem.style.width = `calc(47% - ${widhCorrection})`;
        }
    }

    /**
     * rotate cube at the beggining of the game. Show "loading" and then "Your move"
     */
    private rotateCubeFirstMove(): void {
        let cube = document.getElementsByClassName('cube')[0] as HTMLElement;
        helper.toggleClassOfHtmlElem(cube, 'show-bottom', 'show-top');
    }

    /**
     * rotate cube and show timer and message "Your move"
     * @returns Promise<"done">  
     */
    rotateCubeTimer(): Promise<"done"> {
        return new Promise((resolve, reject) => {
            let cube = document.getElementsByClassName('cube')[0] as HTMLElement;
            helper.toggleClassOfHtmlElem(cube, 'show-top', 'show-right');
            cube.ontransitionend = () => {
                cube.ontransitionend = null;
                resolve('done');
            }
        });
    }

    /**
     * clear message "wait your turn"
     */
    clearWaitYorTurnMsg() {
        if (Enum.getMesssagesEnum().wait === this.currentMessage) {
            this.updateStatus('');
        }
    }

    /**
     * shows regisration form
     */
    showRegForm() {
        this.regForm.show();
    }

    /**
     * shows login form
     */
    showLoginForm() {
        this.loginForm.show();
    };

    /**
     * log out user
     */
    logOut() {
        if (this.userId !== null) {
            this.userId = null;
            this.userName = null;
            const logInNameSection = document.getElementsByClassName("loginName")[0];
            logInNameSection.innerHTML = "You are not logged in";
            //clear cookies or local storage
            localStorage.removeItem("warShipUser");
        }
    }

    /**
     * automaticaly login user at the start of the game if he did not log out. Uses information from the localstorage.
     */
    private autoLogIn() {
        const userFromLS = localStorage.getItem("warShipUser");
        if (userFromLS) {
            const userInfoParsed = JSON.parse(userFromLS) as userInfoFromLSType;
            this.userId = userInfoParsed.userId;
            this.userName = userInfoParsed.name;
            const logInNameSection = document.getElementsByClassName("loginName")[0];
            logInNameSection.innerHTML = `Logged in as ${this.userName}`;
        }
    }

    /**
     * ends and restarts game.
     */
    endGame() {
        this.clearSessionStorage();
        location.reload();
    }

    /**
     * clear session storage
     */
    private clearSessionStorage() {
        sessionStorage.removeItem("replay");
        sessionStorage.removeItem("replayInfo");
    }

    /**
     * states replay the chosen game
     * @param statistics - object of the replayGameInfoType
     */
    replay(statistics: replayGameInfoType): void {
        sessionStorage.setItem("replay", "replay");
        const statInfoForLS = JSON.stringify(statistics);
        sessionStorage.setItem("replayInfo", statInfoForLS);
        location.reload();
    }

    /**
     * make first move in the replay mode
     */
    private replayMoves(): void {
        this.state = this.gameState.playerTurn;
        this.playerBoard.dragAndDropEnabled = false;
        this.computerBoard.setPlayerTurn(true);
        this.updateStatus(this.msgs.gameOn);
        let i = this.replayCounterMoves;
        let r = this.replayMoveArray[i].row;
        let c = this.replayMoveArray[i].column;
        setTimeout(() => this.computerBoard.replayBombCell(r, c), 1500);
        this.replayCounterMoves++;
    }


    /**
     * bomb computer or player board in replay mode.
     * @param typeOfBoard -computer board or player board
     */
    private bombBoardInReplayMode(typeOfBoard: "computer" | "player"): void {
        let i = this.replayCounterMoves;
        if (i < this.replayMoveArray.length) {
            let r = this.replayMoveArray[i].row;
            let c = this.replayMoveArray[i].column;
            if (typeOfBoard === "computer") this.computerBoard.replayBombCell(r, c);
            else this.playerBoard.replayBombCell(r, c);
            this.replayCounterMoves++;
        }
    }

    /**
     * save information about the game to replay later.
     * @param userId -user id
     * @param result - victory or defeat
     */
    private saveGameInfoForReplay(userId: string, result: "victory" | "defeat",) {
        const compBoardShipsPositions = this.computerBoard.getShipsPositionsForReplayAndRestore();
        const playerBoardShipsPosition = this.playerBoard.getShipsPositionsForReplayAndRestore();
        const movesInfo: replayMovesType = this.replayMoveArray;
        const date = helper.getCurrentDate();

        const gameInfo: statisticsToSaveType = {
            userId: this.userId,
            gameToReplay: {
                date,
                result,
                duaration: this.timer.timerElement.innerText,
                positionOfShips: {
                    computerBoard: compBoardShipsPositions,
                    playerBoard: playerBoardShipsPosition
                },
                moves: movesInfo
            }
        };
        fetch("/saveStat", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gameInfo)
        }).then((res) => res.json()).then((dataResponse: statisticsToSaveResponseType) => {
            this.menu.setStatistics(null);//clear cashed statistics
        });
    }

    /**
     * cheks if the user is logged in.
     * @returns true or false
     */
    isLoggedIn(): boolean {
        return this.userId !== null;
    }

    /**
     * 
     * @returns returns user's id or null if user is not logged in.
     */
    getUserId(): string | null {
        return this.userId;
    }

    /**
     * sets user's id.
     * @param userId - user's id.
     */
    setUserId(userId: string): void {
        this.userId = userId;
    }

    /**
     * sets user's name.
     * @param userName - user's name
     */
    setUsername(userName: string) {
        this.userName = userName;
    }

    /**
     * 
     * @returns two dimensional row containing coordinates of the last hits of the ship
     */
    getComplexLastHitsCoord(): { row: number, column: number }[][] {
        return this.complexLastHitsCoord;
    }

    /**
     * 
     * @param indexOfShip -index of ship in the array of ships. In the class Board - class field "ships"
     * @param arrayOfHits -array of hits of the ship.
     */
    setComplexLastHitsCoord(indexOfShip: number, arrayOfHits: { row: number, column: number }[]): void {
        this.complexLastHitsCoord[indexOfShip] = arrayOfHits;
    }

    /**
     * gets game's info to restore the game
     * @returns 
     */
    getGameSnapShot(): gameSnapShotToRestore {
        const computerBoardCells = this.computerBoard.getCellsStatesForRestore();
        const playerBoardCells = this.playerBoard.getCellsStatesForRestore();
        const computerBoardShips = this.computerBoard.getShipsPositionsForReplayAndRestore();
        const playerBoardShips = this.playerBoard.getShipsPositionsForReplayAndRestore();
        const stateOfGame = this.state/* === 2 ? 3 : this.state === 3 ? 2 : this.state;*///change the state of game to opposite. Computer turn to Player turn and on the contrary
        const computerHits = this.complexLastHitsCoord;
        const arrayOfMoves=this.replayMoveArray;
        const time = this.timer.currentTime;
        return { computerBoardCells, playerBoardCells, computerBoardShips, playerBoardShips, stateOfGame, computerHits, arrayOfMoves, time };
    }

    /**
     * saves game's info for restore in local storage
     */
    saveGameSnapShot(): void {
        const gameSnapShot = this.getGameSnapShot();
        const strGameSnapShot = JSON.stringify(gameSnapShot);
        localStorage.setItem("restoreGameInfo", strGameSnapShot);
        localStorage.setItem("restore", "yes");
    }

    /**
     * clears info for restoring game
     */
    clearGameSnapShot() {
        localStorage.setItem("restoreGameInfo", "");
        localStorage.setItem("restore", "no");
    }
}

export default Game;
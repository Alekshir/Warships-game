import Ship from "../Ship/Ship";
import Cell from "../Cell/Cell";
import Game from "../Game/Game";
import Spiner from "../Spiner/Spiner";
import soundObject from "../Sounds/Sounds";
import helper from "../Helpers/Helpers";
import { replayRestoreShipsPositions, cellsStatesForRestore } from "../../types/Types";
import { gameStateEnum } from "../Enum/Enum";

//We are in the branch by name "branchWithNewPattern"

class Board {

    private playerBoard: boolean //is this player board
    private game: Game;
    private ships: Ship[];
    private cells: Cell[][];             // two dimension array [rows][columns]
    private playerTurn = false;          // Set to true when player can move
    private shipSizes = [5, 4, 3, 3, 2];
    private positioningEnabled: boolean;    // Set to true when the player can position the ships
    private isDragging: boolean = false; //true when a ship is beeng dragged.
    private element: HTMLElement;
    private timerOfPlayerTurnStart: NodeJS.Timeout;
    private mode: "replay" | "restore";
    spiner: Spiner;

    /**
     * 
     * @param element -HTMLElement of the Board
     * @param cellClassNameArray  -array of class names of Cell HTMLElement
     * @param cellClassInnerElementArray - array of class names for inner HTMLElement of Cell
     * @param shipsClassNameArray - array of clasnames oF Ship HTMLElement
     * @param playerBoard - is it playerboard? true or false. Default is true.
     * @param mode -"replay" in replay mode. Other case is null.
     * @param shipPositionsForReplay - information about ship positions for replay/restore the game.
     * @param cells - information about cells for replay/restore game.
     * @param game - instance of the Game class.
     */
    constructor(element: HTMLElement, cellClassNameArray: string[], cellClassInnerElementArray: string[], shipsClassNameArray: string[], playerBoard: boolean = true, mode: "replay" | "restore" | null, shipPositionsForReplay: replayRestoreShipsPositions | null, cells: cellsStatesForRestore | null, game: Game) {
        this.mode = mode;
        this.playerBoard = playerBoard;
        this.element = element;
        this.positioningEnabled = false;
        this.spiner = new Spiner();
        this.game = game;
        this.fillBoardWithCellsAndShips(cellClassNameArray, cellClassInnerElementArray, shipsClassNameArray, shipPositionsForReplay, cells);

        if (!playerBoard) {
            // Computer board, this is where the player clicks to bomb
            this.onCellClick = this.onCellClick.bind(this);//bind method.Thus all references to this inside method in addEvenlisteners will be references to this class.
            if (mode !== "replay") this.element.addEventListener('click', this.onCellClick);//adds this.onCellClick as event listener on "click" event.
        }
        this.makeShipDraggable = this.makeShipDraggable.bind(this);//bind all references to this inside method to th einstance of this class.
        this.makeShipsFlippable = this.makeShipsFlippable.bind(this);
    }

    /**
     * adds ships and cells to the board.
     * @param cellClassNameArray- array with the class names of the Cell's HTMLElement.
     * @param cellClassInnerElementArray - array with the names of the Cell's inner HTMLElement.
     * @param shipsClassNameArray - array with the class names of the Ship's inner HTMLElement.
     * @param shipPositionsForReplay - ships positions on the board in Games's replay mode.
     */
    private fillBoardWithCellsAndShips(cellClassNameArray: string[], cellClassInnerElementArray: string[], shipsClassNameArray: string[], shipPositionsForReplay: replayRestoreShipsPositions, cellsToRestore: cellsStatesForRestore): void {
        this.cells = this.createCells(cellClassNameArray, cellClassInnerElementArray);

        if (this.mode === "replay") {
            this.ships = this.replayCreateShips(shipPositionsForReplay, shipsClassNameArray);
            this.updateCellData();
        } else if (this.mode === "restore") {

            this.ships = this.replayCreateShips(shipPositionsForReplay, shipsClassNameArray);
            this.updateCellData();
            this.changeCellsToRestoreGame(cellsToRestore);
            setTimeout(() => this.setShipsHitsToRestoreGame(shipPositionsForReplay), 100);//getout of main script stream to perform at the end of the method to prevent "this.ships.forEach(ship => { ...this.ships.forEach(ship => { " override visibility of ships
        } else this.ships = this.createShips(shipsClassNameArray);

        this.ships.forEach(ship => {
            let shipElement = ship.getElement();
            if (this.playerBoard) {//if this is the player board make ships draggable.
                this.makeShipDraggable(ship, this.element);
                this.makeShipsFlippable(ship);
            } else shipElement.classList.add('ship_unvisible');// if computer board then make ship unvisible.
            //!this.playerBoard ? shipElement.classList.add('ship_unvisible') : null;
            this.element.appendChild(shipElement);//append Ships HTMLElement to the Board's HTMLElement.
        });
    }

    /**
     * restore cells css classes in restore mode and hits of cells
     * @param cells 
     */
    private changeCellsToRestoreGame(cells: cellsStatesForRestore): void {
        for (let i = 0; i < cells.length; i++) {
            const row = cells[i];
            for (let j = 0; j < row.length; j++) {
                const cellElement = this.cells[i][j].getElement();
                cells[i][j].state === "exploaded" ? (cellElement.classList.remove("cell_notBombed"), cellElement.classList.add("cell_cellHit"), this.cells[i][j].setHasHit(true)) :
                    cells[i][j].state === "hitButEmpty" ? (cellElement.classList.remove("cell_notBombed"), cellElement.classList.add("cell_cellMiss"), this.cells[i][j].setHasHit(true)) : null;
            }
        }
    }


    /**
     * sets hits to the ships to restore their state and shows sunk ships on the computerboard
     * @param shipPositionsForReplay 
     */
    private setShipsHitsToRestoreGame(shipPositionsForRestore: replayRestoreShipsPositions): void {
        this.ships.forEach((ship, i) => {
            ship.setHits(shipPositionsForRestore[i].hits);
            if (!this.playerBoard) {
                if (ship.getHits() === ship.getSize()) {
                    this.showShip(ship);
                }
            }
        });
    }

    /**
     * sets value to the this.playerTurn
     * @param turn - true or false
     */
    setPlayerTurn(turn: boolean): void {
        this.playerTurn = turn;
    }

    /**
     * create cells for the board
     * @param cellClassNameArray - array of class names of the Cell's HTMLElement 
     * @param cellClassInnerElementArray - array of class names of the Cell's inner HTMLElement
     * @returns Cell[][] two dimension array arr[i][j] where i is row and j is column of the board.
     */
    private createCells(cellClassNameArray: string[], cellClassInnerElementArray: string[]): Cell[][] {
        let cell: Cell;

        // Create the cells for the board
        let cells: Cell[][] = [];
        for (let row = 0; row < 10; row++) {
            cells[row] = [];
            for (var column = 0; column < 10; column++) {
                cell = new Cell(row, column, cellClassNameArray, cellClassInnerElementArray);//create instance of Cell class
                cells[row][column] = cell;//add to cell array
                this.element.appendChild(cell.getElement());//append Cell'sHTMLElement to the board.
                cell.getElement().dataset.cellLocation = cell.cellLocation();//we attach to data attribute as string "row, column"
            }
        }
        return cells;
    }

    /**
     * In normal mode of the Game(not "replay") create Ship[] - array of instances of Ship class.
     * @param shipsClassNameArray - array of class names of Ship's HTMLElement.
     * @returns Ship[] - array of instances of Ship class.
     */
    private createShips(shipsClassNameArray: string[]): Ship[] {
        let ships: Ship[] = [];
        for (let i = 0; i < this.shipSizes.length; i++) {
            let ship = new Ship(this.shipSizes[i], shipsClassNameArray); // create ships
            ships[i] = ship;//put ship into the array
            ship.updatePosition(i, 0, false); //sets initial ship position. Sets its row,column properties
        }
        return ships;
    }

    /**
     * Replay mode. Creates array of ships according to the information about the game which has to be replayed.
     * @param replayShipsInfo -information with positions of the ships
     * @param shipsClassNameArray - array with class names of Ship's HTMLElement
     * @returns  Ship[] - array of instances of class Ship
     */
    private replayCreateShips(replayShipsInfo: replayRestoreShipsPositions, shipsClassNameArray: string[]): Ship[] {
        let ships: Ship[] = [];
        replayShipsInfo.forEach(shipInfo => {
            let ship = new Ship(shipInfo.size, shipsClassNameArray);
            ships.push(ship);
            ship.updatePosition(shipInfo.row, shipInfo.column, shipInfo.isVertical);
        });
        return ships;
    }

    /**
     * make ship draggable
     * @param ship -ship
     * @param boardElement -HTMLElement of the Board.
     */
    private makeShipDraggable(ship: Ship, boardElement: HTMLElement): void {

        const onMouseDownHandler = (e: MouseEvent) => {
            let boardCoord: DOMRect, boardHeight: number, boardWidthReal: number, deltaY: number, deltaX: number;
            const board = document.getElementById("boards");

            if (helper.isMobileMode()) ({ boardCoord, boardHeight, boardWidthReal, deltaY, deltaX } = helper.getCoordForMakeShipsDraggableMouseDownOrTouchStartHandler(e, ship, boardElement, false));//if in mobile mode
            else ({ boardCoord, boardHeight, boardWidthReal, deltaY, deltaX } = helper.getCoordForMakeShipsDraggableMouseDownOrTouchStartHandler(e, ship, boardElement, true));

            const onMouseMoveHandler = (e: MouseEvent) => {
                e.preventDefault();
                this.isDragging = true;
                if (!this.positioningEnabled) return;
                if (helper.isMobileMode())
                    helper.setShipCoordForMakeShipsDraggableMouseMoveOrTouchMoveHandler(e, boardCoord, ship, deltaX, deltaY, false);
                else helper.setShipCoordForMakeShipsDraggableMouseMoveOrTouchMoveHandler(e, boardCoord, ship, deltaX, deltaY, true);
            };

            const onMouseUpHandler = (e: MouseEvent) => {
                if (helper.isMobileMode())
                    helper.updateShipPositionForMakeShipsDraggableMouseUpOrTouchEndHandler(ship, boardCoord, boardWidthReal, boardHeight, false);
                else helper.updateShipPositionForMakeShipsDraggableMouseUpOrTouchEndHandler(ship, boardCoord, boardWidthReal, boardHeight, true);
                setTimeout(() => this.isDragging = false, 500); //prevent other events fire when we stop dragging

                document.removeEventListener('mousemove', onMouseMoveHandler);
                document.removeEventListener('mouseup', onMouseUpHandler)
            }
            document.addEventListener('mouseup', onMouseUpHandler);
            document.addEventListener('mousemove', onMouseMoveHandler, { passive: false });//{ passive: false} suppress error preventDefault inside passive event listener due to target being treated as passive.  https://github.com/inuyaksa/jquery.nicescroll/issues/799
        }

        ship.getElement().addEventListener("mousedown", onMouseDownHandler);

        /**
         * drag and drop implementation for mobile devices
         **/
        const onTouchStartHandler = (e: TouchEvent) => {
            const board = document.getElementById("boards");
            let boardCoord: DOMRect, boardHeight: number, boardWidthReal: number, deltaY: number, deltaX: number;
            if (helper.isMobileMode())
                ({ boardCoord, boardHeight, boardWidthReal, deltaY, deltaX } = helper.getCoordForMakeShipsDraggableMouseDownOrTouchStartHandler(e.touches[0], ship, boardElement, false));
            else ({ boardCoord, boardHeight, boardWidthReal, deltaY, deltaX } = helper.getCoordForMakeShipsDraggableMouseDownOrTouchStartHandler(e.touches[0], ship, boardElement, true));

            const onTouchMoveHandler = (e: TouchEvent): void => {
                e.preventDefault();
                this.isDragging = true;

                if (!this.positioningEnabled) return;
                if (helper.isMobileMode())
                    helper.setShipCoordForMakeShipsDraggableMouseMoveOrTouchMoveHandler(e.touches[0], boardCoord, ship, deltaX, deltaY, false);
                else helper.setShipCoordForMakeShipsDraggableMouseMoveOrTouchMoveHandler(e.touches[0], boardCoord, ship, deltaX, deltaY, true);
            };

            const onTouchEndHandler = (e: TouchEvent): void => {
                if (helper.isMobileMode())
                    helper.updateShipPositionForMakeShipsDraggableMouseUpOrTouchEndHandler(ship, boardCoord, boardWidthReal, boardHeight, false);
                else helper.updateShipPositionForMakeShipsDraggableMouseUpOrTouchEndHandler(ship, boardCoord, boardWidthReal, boardHeight, true);
                setTimeout(() => this.isDragging = false, 500);
                document.removeEventListener('touchmove', onTouchMoveHandler);
                document.removeEventListener('touchend', onTouchEndHandler)
            }
            document.addEventListener('touchend', onTouchEndHandler);
            document.addEventListener('touchmove', onTouchMoveHandler, { passive: false });//{ passive: false} suppress error preventDefault inside passive event listener due to target being treated as passive.  https://github.com/inuyaksa/jquery.nicescroll/issues/799
        }

        ship.getElement().addEventListener("touchstart", onTouchStartHandler);
    }

    private makeShipsFlippable(ship: Ship): void {
        ship.getElement().addEventListener('click', (e: MouseEvent) => {
            e.preventDefault();
            if (this.positioningEnabled && !this.isDragging) ship.flipShip();
        });
    }

    set dragAndDropEnabled(val: boolean) {//setter for property dragAndDropEnabled
        this.positioningEnabled = val;// set the property true(player can position ships) or false (can not)
    }

    /**
     * return random coordinates of the ship
     */
    private getRandomPosition(): { row: number, column: number, vertical: boolean } {
        return {
            "row": Math.floor(Math.random() * 10),
            "column": Math.floor(Math.random() * 10),
            "vertical": (Math.floor(Math.random() * 2) === 1)
        }
    }

    /**
     * cell click event handler
     * @param evt - An event which takes place in the DOM.
     * @returns -void
     */
    private onCellClick(evt: Event): void {
        let target = <HTMLElement>evt.target;//element we click on
        if (!target.classList.contains("cell")) {// if this element does not have class='cell' The element is not cell
            return;
        }
        this.game.onComputerBoardEvent('click', { row: null, column: null }, { target }); // we call onEvent function with parameter 'click'. The dtfininition of the function is set in class Game
    }

    /**
     * bomb the cell a user or computer chose.
     * @param cellElem - HTML element of the cell.
     * @returns - void
     */
    bombCell(cellElem: HTMLElement): void {
        let cellLocation: string = cellElem.dataset.cellLocation;
        let cellPos: { row: number, column: number } = Cell.parseCellLocation(cellLocation);//we get info from data attribute of the cell as string 'row,colomn' and transform it in the object {'row':x, 'colomn':y}
        let cell = this.cells[cellPos.row][cellPos.column];//we choose the cell with this coordinates from array of cells

        if (cell.getHasHit()) {
            return;  // Already been clicked on
        }

        let shipIndex = cell.getShipIndex();

        if (shipIndex >= 0) { // Has a ship

            cell.markCellAsShipHit();
            let ship = this.ships[shipIndex];// choose the ship from array of the ships by shipIndex
            ship.setHits(1);

            if (!this.playerTurn) {//click on the player board
                if (!(this.game.getComplexLastHitsCoord()[shipIndex])) {//update base of computer moves.
                    this.game.setComplexLastHitsCoord(shipIndex, [{ row: cellPos.row, column: cellPos.column }]);
                } else {
                    this.game.getComplexLastHitsCoord()[shipIndex].push({ row: cellPos.row, column: cellPos.column });
                }

                this.startExplosion(cellElem).then((_) => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => this.startExplosion(cellElem).then((_) => resolve(true)), 100);
                    });//double explosion. //we use setTimeout with minimum delay here because something strange happens without it. Ontransionend which we use inside startExplosion does not work correctly.
                }).then((_) => {

                    clearInterval(this.timerOfPlayerTurnStart);//stop timer which counts time till the player turn
                    this.game.rotateCubeTimer().then((_) => {
                        this.game.clearWaitYorTurnMsg();//if the was the message "wait your turn" clear it.
                        this.mode !== "replay" ? this.spiner.hideSpiner() : null; //no spiner in replay mode
                        if (ship.isSunk()) {
                            this.game.setComplexLastHitsCoord(shipIndex, null);//change the array of computer bombs the ship with null
                            if (this.allShipsSunk()) {
                                this.game.onPlayerBoardEvent('allSunk', cellPos);//calling playerBoard.onEvent('allSunk')
                            } else {
                                this.game.onPlayerBoardEvent('shipSunk', cellPos);//calling playerBoard.onEvent('shipSunk')
                            }
                        } else {
                            this.game.onPlayerBoardEvent('hit', cellPos, ship);//calling playerBoard.onEvent('hit')
                        }
                    });
                });
            } else {//click on the computer board.
                //when we click on the computer board we at first call computerboard.onEvent (transfer control to the computer) and then starts explosion. We do this to prevent opportunity of the second hit on at the computer board.
                if (ship.isSunk()) {
                    if (this.allShipsSunk()) {
                        this.game.onComputerBoardEvent('allSunk', cellPos, { ship });//calling computerboard.onEvent('allSunk');
                    } else {
                        this.game.onComputerBoardEvent('shipSunk', cellPos, { ship });
                    }
                } else {//ship only hit
                    this.game.onComputerBoardEvent('hit', cellPos, { ship });
                }
                this.startExplosion(cellElem).then((_) => {
                    //second explosion
                    return new Promise<"done">((resolve, reject) => {
                        setTimeout(() => this.startExplosion(cellElem).then(() => resolve('done')), 100);//we use setTimeout with minimum delay here because something strange happens without it. Ontransionend which we use inside startExplosion does not work correctly.

                    });
                });
            }
        } else {//if missed(no ship on clicked cell)
            cell.markCellAsShipMiss();//mark the cell as missed
            if (!this.playerTurn) {//if computer is playing
                this.startExplosion(cellElem).then(() => {
                    clearInterval(this.timerOfPlayerTurnStart);

                    return new Promise<"done">((resolve, reject) => {
                        this.game.rotateCubeTimer().then(() => {
                            if (this.mode !== "replay") this.spiner.hideSpiner();//hide spiner if it is a normal mode. In replay mode there is no spiner.
                            this.game.clearWaitYorTurnMsg();
                            resolve('done');
                        });
                    });
                }).then((_) => this.game.onPlayerBoardEvent('playerMissed', cellPos));
            } else {//player is playing
                this.game.onComputerBoardEvent('playerMissed', cellPos);
                this.startExplosion(cellElem);
            }
        }
    }

    /**
     * 
     * @returns true if all ships are sunk or false.
     */
    private allShipsSunk(): boolean {
        return this.ships.every(function (val) { return val.isSunk(); });//MYNOTE take array this.ships and by every() method tests that each element of the array isSunk()
    }

    /**
     * randomize pozition of ships
     */
    randomize(): void {
        let shipCount = this.ships.length;
        do { // loop till coordinates of ships are different and we do not have duplicates
            for (let shipIndex = 0; shipIndex < shipCount; shipIndex++) {
                var pos = this.getRandomPosition();
                this.ships[shipIndex].updatePosition(pos.row, pos.column, pos.vertical);
            }
        } while (!this.boardIsValid());
    }

    /**
     * cheks if are ships in right position
     * @returns - true if ships in right position or false. 
     */
    boardIsValid(): boolean {
        // Check if any ships overlap each other (checking their cells for duplicates).
        // Do this by putting into a flat array, sorting, and seeing if any adjacent cells are equal
        let allCells: string[] = [];
        for (let i = 0; i < this.ships.length; i++) {// we loop through array this.ships
            allCells = allCells.concat(this.ships[i].getCellsCovered()); //we concat results of method getCellsCovered() and as the result we get array like this ['0,1', '3,4' , '6,4']
        }
        allCells.sort();//we can do in in O(n) time with the help of the Map. In our case we do it in O(nlogn)
        let dups = allCells.some(function (val, idx, arr) { return val === arr[idx + 1]; });//MYNOTE we use method some on our sorted array with coordinates of the ships. It returns true if there are equal values near each other

        // See if any ship cells are off the board
        let outOfRange = allCells.some(function (val: string) { // we use method some on our sorted array with coordinates of the ships
            let pos = Cell.parseCellLocation(val);//MYNOTE we transform string implementation of coordinates to object implementation
            return !(pos.column >= 0 && pos.column <= 9 && pos.row >= 0 && pos.row <= 9); // check values of rows and columns
        });
        if (dups || outOfRange) {// if there are duplicates or coordinates out of range
            return false;
        } else {
            this.updateCellData(); //update info of the cells. The definition of the method is lower
            return true;
        }
    }

    /**
     * update cells data with information about ships/
     */
    private updateCellData(): void {
        for (let i = 0; i < 100; i++) {
            let cell = this.cells[Math.floor(i / 10)][i % 10];//MYNOTE Math.floor(i / 10) this is the row; [i % 10] this is the colomn. We get cell from array of this.cells
            cell.setHasHit(false);//set the property "hasHit" of the cell to the false
            cell.setShipIndex(-1);//set the property 'shipIndex' of the cell to -1 (no ship in the cell)
        }

        for (let index = 0; index < this.ships.length; index++) {// we loop throu array of ships (this.ships)
            var ship = this.ships[index] // get the ship from the array
            ship.setHits(0);//sets the property 'hits' of the ship to 0
            let cells = ship.getCellsCovered(); //gets coordinates of the ship in the way like this ['1,2', '1,3', '1,4']
            for (let cell = 0; cell < cells.length; cell++) {//we loop through the array 'cells'
                let cellPos = Cell.parseCellLocation(cells[cell]);//get the coordinates of the current cell as object {'row':x,'column':y}
                let targetCell = this.cells[cellPos.row][cellPos.column];// get cell with this coordinates from array of cells
                targetCell.setShipIndex(index);//set the property'shipIndex' of the cell to index (the number of the ship)
            }
        }

        this.cells.forEach(rowCell => rowCell.forEach(cell => cell.setClassNameToInitialState()));//set intial css class names to cells.
    }

    /**
     * computer chooses move
     */
    chooseMove(): void {
        //this.spiner.showSpiner();
        const waitMove = () => { if (!this.playerTurn) this.game.onComputerBoardEvent("click") };
        this.spiner.getElement().addEventListener("click", waitMove, { once: true });
        let cell: Cell;
        let pos: { row: number, column: number, vertical: boolean };
        let posIfHits: { row: number, column: number };
        let y: number;
        let x: number;
        let yEnd: number;
        let xEnd: number;
        let randNum: number;
        let possibleMoves: { row: number, column: number }[];
        let m: Boolean = true;
        let tempArray: { row: number, column: number }[][];
        let inTempArray: { row: number, column: number }[];

        if (this.game.getComplexLastHitsCoord().every(function (v) { return v === null; })) {//no previous hits
            do {
                pos = this.getRandomPosition(); //we get random row and column as object {"row":x, "colomn":y, "vertical":z}
                cell = this.cells[pos.row][pos.column]; //choose the cell according with coordinates
            } while (cell.getHasHit()); //if cell has hit do another iteration
            this.bombCell(cell.getElement()); //  when we find such cell we call bombCell(cell.element) method
        } else {
            tempArray = this.game.getComplexLastHitsCoord().filter(function (v) { return v != null });//filter out ships that have been sunk
            inTempArray = tempArray[0];//a ship that has hits
            if (inTempArray.length === 1) {//if there is one hit
                y = inTempArray[0].row;
                x = inTempArray[0].column;
                possibleMoves = [{ row: y, column: x + 1 }, { row: y, column: x - 1 }, { row: y + 1, column: x }, { row: y - 1, column: x }];

                do {
                    randNum = Math.floor(Math.random() * 4);
                    posIfHits = possibleMoves[randNum];
                    if (posIfHits.row < 0 || posIfHits.row > 9 || posIfHits.column < 0 || posIfHits.column > 9) {
                        continue;
                    }

                    cell = this.cells[posIfHits.row][posIfHits.column]; //choose the cell according with coordinates
                    m = cell.getHasHit();
                } while (m);

                this.bombCell(cell.getElement());
            } else if (inTempArray.length > 1) {//if two or more hits
                if (inTempArray[0].column === inTempArray[1].column) {//if ship is vertical

                    inTempArray.sort(function (a, b) { return (a.row - b.row) });
                    y = inTempArray[0].row;
                    x = inTempArray[0].column;
                    yEnd = inTempArray[inTempArray.length - 1].row;
                    possibleMoves = [{ row: y - 1, column: x }, { row: yEnd + 1, column: x }];
                } else {//if ship is horizontal
                    inTempArray.sort(function (a, b) { return (a.column - b.column) });
                    y = inTempArray[0].row;
                    x = inTempArray[0].column;
                    xEnd = inTempArray[inTempArray.length - 1].column;
                    possibleMoves = [{ row: y, column: x - 1 }, { row: y, column: xEnd + 1 }];
                }
                do {
                    randNum = Math.floor(Math.random() * 2);
                    posIfHits = possibleMoves[randNum];
                    //choose the cell according with coordinates
                    if (posIfHits.row < 0 || posIfHits.row > 9 || posIfHits.column < 0 || posIfHits.column > 9) {
                        //m = true;
                        continue;
                    }
                    cell = this.cells[posIfHits.row][posIfHits.column];
                    m = cell.getHasHit();
                } while (m);
                this.bombCell(cell.getElement());
            }
        }
    }

    /**
     * rotate cube and show message "computer thinking with timer"
     */
    timerComputerThinkingStart(): void {
        let cube = document.getElementsByClassName('cube')[0] as HTMLElement;
        const timerWindow = document.getElementsByClassName('cube__face--right')[0];
        let counter = 0;

        this.timerOfPlayerTurnStart = setInterval(() => {
            ++counter;
            timerWindow.innerHTML = 'computer is thinking!<br>' + counter;
        }, 1000);
        timerWindow.innerHTML="computer is thinking!<br>0";
        helper.toggleClassOfHtmlElem(cube, 'show-top', 'show-right');
    }

    clearCompThinkingTimer(){
        const timerWindow = document.getElementsByClassName('cube__face--right')[0];
        timerWindow.innerHTML="";
    }

    /**
     * perform explosion 
     * @param cellElem 
     * @returns 
     */
    private startExplosion(cellElem: HTMLElement): Promise<"done"> {
        let explosionElem = cellElem.firstElementChild as HTMLElement;
        let p = new Promise<'done'>((resolve, reject) => {

            soundObject.getExplosionSound().load();
            try {
                soundObject.getExplosionSound().play().catch((error => console.log(error)));//to prevent error in restore mode. Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first
            } catch (error) { console.log(error) }

            explosionElem.ontransitionend = function () {//explosion ends grow (explosionElem.classList.add('animationExplosion_show'))
                explosionElem.ontransitionend = null;

                explosionElem.classList.remove('animationExplosion_show');

                setTimeout(() => {
                    explosionElem.ontransitionend = function () {//explosion ends shrinking (explosionElem.classList.remove('animationExplosion_show');)
                        explosionElem.ontransitionend = null;
                        resolve('done');
                    };
                }, 100);
            }
            explosionElem.classList.add('animationExplosion_show')
        });

        return p;
    }

    /**
     * shows ship
     * @param ship - an instance of the Ship class
     */
    showShip(ship: Ship): void {
        ship.getElement().classList.remove('ship_unvisible');
    }

    /**
     * show all ships at the computer board if you lose game.
     */
    showRestOfTheShips(): void {
        this.ships.filter((ship) => ship.getElement().classList.contains('ship_unvisible'))
            .forEach((ship) => ship.getElement().classList.remove('ship_unvisible'));
    }

    /**
     * hide all ships
     */
    hideAllShips(): void {
        this.ships.forEach(ship => {
            ship.getElement().classList.add('ship_unvisible');
        });
    }

    /**
     * bomb cell inreplay mode
     * @param x -row
     * @param y -column
     */
    replayBombCell(x: number, y: number) {
        const Cell = this.cells[x][y];
        const cellElem = Cell.getElement();
        this.bombCell(cellElem);
    }

    /**
     * 
     * @returns HTML element of the board
     */
    getElement() {
        return this.element;
    }

    /**
     * 
     * @returns return ship positions at the start of the game to save and use to replay or restore game
     */
    getShipsPositionsForReplayAndRestore(): replayRestoreShipsPositions {
        const shipsPositions: replayRestoreShipsPositions = [];
        this.ships.forEach((ship) => {
            let shipPosition: { row: number, column: number, size: number, isVertical: boolean, hits: number } = ship.getShipPositionForReplay();
            shipsPositions.push(shipPosition);
        });
        return shipsPositions;
    }

    /**
     * get cell's statets to use to restore game
     * @returns 
     */
    getCellsStatesForRestore(): cellsStatesForRestore {
        const cellsStatesArray: cellsStatesForRestore = [];
        this.cells.forEach(cellRow => {
            const row = [];
            cellRow.forEach(cell => {
                const isHit = cell.getHasHit();
                const hasShip = cell.getShipIndex() > -1;
                const isExploaded = isHit && hasShip;
                isExploaded ? row.push({ state: "exploaded", shipIndex: cell.getShipIndex() }) :
                    isHit ? row.push({ state: "hitButEmpty", shipIndex: cell.getShipIndex() }) : row.push({ state: "unTouched", shipIndex: cell.getShipIndex() });
            });
            cellsStatesArray.push(row);
        });
        return cellsStatesArray;
    }
}

export default Board;
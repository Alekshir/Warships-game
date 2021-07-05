import helper from "../Helpers/Helpers";

class Cell {
    private shipIndex: number;//if ship contains this cell, the index of the ship in the array of the Board class field "ships".
    private hasHit: boolean; //if cell has hit
    private element: HTMLElement; //HTML element of the Cell
    private row:number;
    private column:number;

    /**
     * 
     * @param row - of the cell on the board
     * @param column -of the cell on the board
     * @param classNamesArray - array of css class names for Cell HTML element
     * @param classNamesArrayInnerElement  - array of css names for Cell HTML inner element
     */
    constructor(row: number, column: number, classNamesArray:string[], classNamesArrayInnerElement:string[]) {
        this.element = helper.createCellHtmlElement(classNamesArray, classNamesArrayInnerElement);
        this.row=row;
        this.column=column;
    }

    getElement():HTMLElement{
        return this.element;
    }

    getHasHit():boolean{
        return this.hasHit;
    }

    setHasHit(hasHit:boolean):void{
        this.hasHit=hasHit;
    }

    getShipIndex():number{
        return this.shipIndex;
    }

    setShipIndex(shipIndex:number){
        this.shipIndex=shipIndex;
    }

    /**
     * returns all css classes of Cell HTML element to initial state
     */
    setClassNameToInitialState(){
        if(this.element.classList.contains('cell_cellHit')) this.element.classList.remove('cell_cellHit');
        else if (this.element.classList.contains('cell_cellMiss')) this.element.classList.remove('cell_cellMiss');

        if(!this.element.classList.contains('cell_notBombed')) this.element.classList.add('cell_notBombed');
    }

    /**
     * Parse a cell location of the format "row,column". It gets as argument result of cellLocation() and makes from string "row, column" object {'row':row, 'column':column}
     * @param pos - string of the format "row,column".
     */
    static parseCellLocation(pos: string):{row:number, column:number} { // MYNOTE it get as argument result of cellLocation() and makes from string "row, column" object {'row':row, 'column':column}
        var indices: string[] = pos.split(",");
        return { 'row': parseInt(indices[0]), 'column': parseInt(indices[1]) };
    }

    
        /**
         * Returns the cell location of the format "row,column".
         */
    cellLocation():string {
        return "" + this.row + "," + this.column;
    }

    /**
     * mark cell which was hit and contains a ship.
     */
    markCellAsShipHit():void {
        this.setHasHit(true);
        this.element.classList.remove("cell_notBombed");//MYNOTE remove class
        this.element.classList.add("cell_cellHit");// MYNOTE add class 'cellHit'
    }

    /**
     * mark cell which was hit and does not contain a ship.
     */
    markCellAsShipMiss ():void {
        this.setHasHit(true);
        this.element.classList.remove("cell_notBombed");//MYNOTE remove class
        this.element.classList.add("cell_cellMiss");// MYNOTE add class 'cellHit'
    }
    
}

export default Cell;
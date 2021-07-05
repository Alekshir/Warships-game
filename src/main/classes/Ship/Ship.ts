import helper from "../Helpers/Helpers";


class Ship {
    private column:number = 0; //colum at which a ship starts.
    private row:number = 0; //row at which this ship starts.
    private isVertical:boolean = true;
    private hits:number = 0;//number of hits to the ship
    private element: HTMLElement;
    private size:number;//size of the ship

    /**
     * 
     * @param size -of the ship
     * @param classNamesArray - array of css class names of the ship HTML element
     */
    constructor(size: number, classNamesArray:string[]) {
        this.element = helper.createHtmlElement(classNamesArray, "div");
        this.size=size;
    }

    /**
     * changes the values of the class attributes this.row, this.column, this.vertical to values of arguments.
     * @param row - the row where the ship starts.
     * @param column - the column where the ship starts.
     * @param vertical - if the ship is in vertical position
     */
    updatePosition(row: number, column: number, vertical: boolean) {
        this.row = row;
        this.column = column;
        this.isVertical = vertical;
        this.updateLayout();
    }

    
    /**
     * sets style.width, style.height, and style.left, style.top of the element of the ship.
     */
    private updateLayout() {
        const width = "9.9%";
        const height = "" + (this.size * 9.9) + "%"; // MYNOTE--"" at the start of row is this in order the type to be a string?
        this.element.style.left = "" + (this.column * 10) + "%";
        this.element.style.top = "" + (this.row * 10) + "%";
        if(this.isVertical){
            this.element.style.width =width;
            this.element.style.height=height;
            this.element.classList.contains('ship_horizontal')?(this.element.classList.remove('ship_horizontal')):null;
            this.element.classList.add('ship_vertical');        
        } else {
            this.element.style.width =height;
            this.element.style.height=width;
            this.element.classList.contains('ship_vertical')?(this.element.classList.remove('ship_vertical')):null;
            this.element.classList.add('ship_horizontal');
        }
    }

    /**
     * flips ship (rotate by 90 deg)
     */
    flipShip() {
        this.isVertical = !this.isVertical;
        if (this.isVertical) {
            if (this.row + this.size > 10) {//MYNOTE we can write if( this.isVertical&&( (this.row+this.size)>10 ) )
                this.row = this.row - this.size+1;
                this.column = this.column + this.size-1;
            }
        } else {  
            if (this.column + this.size > 10) {
                this.column = this.column - this.size+1;;
                this.row = this.row + this.size-1;
            }
        }
        this.updateLayout();
    }
    
    /**
     * forms an array of cells coordinates "row, column" that the ship covers.
     */
    getCellsCovered() { //MYMOTE we get array where each element is 'x:y' of the cell of the ship
        let cells: string[] = [];
        let row = this.row;
        let col = this.column;
        for (var i = 0; i < this.size; i++) {
            cells.push(row.toString() + "," + col.toString());
            if (this.isVertical) {
                row++;
            } else {
                col++;
            }
        }
        return cells;
    }

    /**
     * detects if the ship is sunk
     * @returns true if the ship is sunk or false
     */
    isSunk() {
        return this.hits === this.size;
    }

    shipVertical():boolean{
        return this.isVertical;
    }

    getSize():number {
        return this.size;
    }

    getElement():HTMLElement{
        return this.element;
    }

    getHits():number{
        return this.hits;
    }

    setHits(hitsNumber:number):void{
        this.hits+=hitsNumber;
    }

    /**
     * 
     * @returns ship position for replay
     */
    getShipPositionForReplay():{row:number, column:number, size:number, isVertical:boolean, hits:number}{
        return {row:this.row, column:this.column, size:this.size, isVertical:this.isVertical, hits:this.hits};
    }
}

export default Ship;
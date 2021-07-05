import Ship from "../Ship/Ship";

class Helpers {

    /**
     * creates HTML element
     * @param classNamesArray - array of css class names of HTML element
     * @returns -HTML element
     */
    createHtmlElement(classNamesArray: string[], typeOfTheElement:string):HTMLElement {
        let htmlElement = document.createElement(typeOfTheElement);
        classNamesArray.forEach(element => htmlElement.classList.add(element));
        return htmlElement;
    }

    /**
     * creates HTML element for Cell
     * @param elementClassesArray - array of class names for HTML element of Cell
     * @param childElementClassesArray - array of class names for inner HTML element of Cell
     * @returns - HTML element of Cell
     */
    createCellHtmlElement(elementClassesArray: string[], childElementClassesArray: string[]):HTMLElement {
        let htmlElement = this.createHtmlElement(elementClassesArray, "div");
        if (childElementClassesArray) {
            let childElement = this.createHtmlElement(childElementClassesArray, "div");
            htmlElement.appendChild(childElement);
        }
        return htmlElement;
    }

    /**
     * create Promise for delay of action
     * @param delay - delay
     * @returns - Promise<unknown>
     */
    createTimeOutPromise(delay: number):Promise<true> {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(true), delay);
        })
    }

    /**
     * toggle two classes
     * @param elem - HTML element 
     * @param firstClass 
     * @param secondClass 
     * @returns HTML element
     */
    toggleClassOfHtmlElem(elem: HTMLElement, firstClass: string, secondClass: string): HTMLElement {

        elem.classList.toggle(firstClass);
        elem.classList.toggle(secondClass);
        return elem;
    }

    /**
     * make SVG letters animation
     * @param svgElement 
     * @returns - Promise<true>
     */
    animateSvgLetters(svgElement: SVGElement):Promise<true> {

        return new Promise((resolve, reject) => {
            svgElement.style.display="block";
            let pathsArray = svgElement.getElementsByTagName('path');
            let lastPath = pathsArray.length - 1;
            Array.prototype.forEach.call(pathsArray, (path: SVGPathElement, i: number) => {
                let len = path.getTotalLength();
                path.style.strokeDasharray = len + ' ' + len;
                path.style.strokeDashoffset = String(len);
                path.getBoundingClientRect();
                let time = (i === 0) ? '' : `${i}s`
                path.style.transition = `stroke-dashoffset 1s ${time} ease-in-out`;
                path.ontransitionend = () => {
                    path.style.fill = 'red';
                    if (i === lastPath) resolve(true);
                };
            });

            setTimeout(() => {
                Array.prototype.forEach.call(pathsArray, (path: SVGPathElement) => {
                    path.style.strokeDashoffset = '0';
                }, 1000);
            });
        });
    }

    /**
     * get coordinates for mouse down event or touch start event
     */
    getCoordForMakeShipsDraggableMouseDownOrTouchStartHandler(e: MouseEvent | Touch, ship: Ship, boardElement: HTMLElement, isBoardTransformed: boolean) {
        let boardCoord = boardElement.getBoundingClientRect();//gets coordinates of the board
        let boardHeight = boardCoord.bottom - boardCoord.top; //gets bord height
        let boardWidth = boardCoord.right - boardCoord.left; //gets board width
        let boardWidthReal = isBoardTransformed ? (boardWidth - boardHeight * Math.tan(Math.PI / 180 * 40)) : boardWidth; //if board is transformed (skewX), calculate real width of the board
        let shipCoord = ship.getElement().getBoundingClientRect();//gets ship coordinates
        const deltaY = e.clientY - shipCoord.top;//delta between mouse(touch) x and ship top coordinate
        const deltaX = isBoardTransformed ? (e.clientX - shipCoord.left - ((e.clientY - shipCoord.top) * Math.tan(Math.PI / 180 * 40))) : e.clientX - shipCoord.left;//delta between mouse(touch) y coordinate and ship left coordinate. If board is transformed we count this.

        return {
            boardCoord,
            boardHeight,
            boardWidthReal,
            deltaY,
            deltaX
        };
    }

    /**
     * sets ships left and top properties on "mousemove" or "touchmove" event
     */
    setShipCoordForMakeShipsDraggableMouseMoveOrTouchMoveHandler(e: MouseEvent | Touch, boardCoord: DOMRect, ship: Ship, deltaX: number, deltaY: number, isBoardTransformed: boolean): void {
        let boardCoordLeftReal = isBoardTransformed ? (boardCoord.left + (e.clientY - boardCoord.top) * Math.tan(Math.PI / 180 * 40)) : boardCoord.left;//gets left coordinate of the board. If the board is transformed, counts it.
        ship.getElement().style.left = (e.clientX - deltaX) - boardCoordLeftReal + 'px';//sets ship's left property relative to the left edge of  the board.
        ship.getElement().style.top = (e.clientY - deltaY) - boardCoord.top + 'px'; //sets ship's top property relative to the top edge of the board.
    }

    
    /**
     * update ship position on "mouseup" event according to row,column coordinates of the board
     * @param ship - an instance of the ship class
     * @param boardCoord - coordinates of the board
     * @param boardWidthReal - board's real width
     * @param boardHeight - board height 
     * @param isBoardTransformed - if the board transformed or not (skewX)
     */
    updateShipPositionForMakeShipsDraggableMouseUpOrTouchEndHandler(ship: Ship, boardCoord: DOMRect, boardWidthReal: number, boardHeight: number, isBoardTransformed: boolean) {
        let shipCoordNew = ship.getElement().getBoundingClientRect();//gets new ship's coordinates
        let boardCoordLeftRealNew =isBoardTransformed?(boardCoord.left + (shipCoordNew.top - boardCoord.top) * Math.tan(Math.PI / 180 * 40)):boardCoord.left; //get real left ship's coordinate. If the board is transformed, counts it.
        let column = Math.round((shipCoordNew.left - boardCoordLeftRealNew) / (boardWidthReal) * 10);//calculate column number
        let row = Math.round((shipCoordNew.top - boardCoord.top) / (boardHeight) * 10); //calculate row number
        if (ship.shipVertical()) {//check edges restrictions if the ship is in vertical position and correct
            if (row + ship.getSize() > 9) row = 10 - ship.getSize();
            if (row < 0) row = 0;
            if (column > 9) column = 9;
            if (column < 0) column = 0;
        } else {//all the same for horizontal position
            if (column + ship.getSize() > 9) column = 10 - ship.getSize(); //MYNOTE we can write if( this.isVertical&&( (this.row+this.size)>10 ) )
            if (column < 0) column = 0;
            if (row > 9) row = 9;
            if (row < 0) row = 0;
        }
        ship.updatePosition(row, column, ship.shipVertical());//update position
    }

    /**
     * 
     * @returns current date in format `${year}-${month}-${day}`
     */
    getCurrentDate() {
        const year = (new Date).getFullYear();
        const month = (new Date).getMonth() + 1;
        const day = (new Date).getDate();
        return `${year}-${month}-${day}`;
    };

    /**
     * wrapper for a promise to interrupt it by timeout
     * @param promiseTOwrap 
     * @param timeout 
     * @returns Promise<unknown>
     */
    promiseWrapperForTimeOut (promiseTOwrap, timeout) {
        return new Promise((resolve, reject)=>{
            const timerToAbort=setTimeout(()=>reject("time out rejection") ,timeout);
            promiseTOwrap.then((result)=>{
                clearInterval(timerToAbort);
                resolve(result);
            }).catch((e)=>{
                clearInterval(timerToAbort);
                reject(e);
            });
        });
    }

    
    /**
     * detects if the game in mobile mode
     * @returns true if in mobile mode or false
     */
    isMobileMode(){
        const board=document.getElementById("boards");
        return window.getComputedStyle(board)["transform"]==="none";
    }
}

const helper = new Helpers();

export default helper;
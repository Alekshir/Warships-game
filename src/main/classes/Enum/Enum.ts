export enum gameStateEnum { animation, begin, computerTurn, playerTurn, finished };

enum messages {
    gameStart = "Drag your ships to the desired location on your board (on the right). To flip a ship click on it. Then click a square on the left board to start the game!",
    invalidPositions = "All ships must be in valid positions before the game can begin.",
    wait = "Wait your turn!",
    gameOn = "Game on!",
    enemyShipHit = "Enemy ship was hit",
    yourShipHit = "Your ship was hit",
    shipSunk = "You sunk a ship!",
    lostShip = "You lost a ship :-(",
    lostGame = "You lost this time. Click anywhere on the left board to play again.",
    allSunk = "Congratulations!  You won!  Click anywhere on the left board to play again."
};

enum shipHitMessages {
    "for the first time",
    "for the second time",
    "for the third time",
    "for the forth time",
    "for the fifth time"
};

class Enum {

    private enumGameState: typeof gameStateEnum;
    private enumMessages: typeof messages;
    private shipHitMessages: typeof shipHitMessages;

    constructor() {
        this.enumGameState = gameStateEnum;
        this.enumMessages = messages;
        this.shipHitMessages = shipHitMessages;
    }


    getGameStateEnum():typeof gameStateEnum
    {
        return this.enumGameState;
    }

    getMesssagesEnum():typeof messages {
        return this.enumMessages;
    }

    getShipHitsMessages():typeof shipHitMessages  {
        return this.shipHitMessages;
    }
}

const e = new Enum();

export default e;

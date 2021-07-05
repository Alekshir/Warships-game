import {gameStateEnum} from "../classes/Enum/Enum";

type computerBoardEvent = "click" | "playerMissed" | "hit" | "shipSunk" | "allSunk";

type playerBoardEvent = "playerMissed" | "hit" | "shipSunk" | "allSunk";

type statisticsType = {
    victories: number,
    defeats: number,
    gamesToReplayArray: replayGameInfoType[]
};

type statisticsToSaveType = {
    userId: string,
    gameToReplay: replayGameInfoType
}

type userInfoFromLSType = {
    userId: string,
    name: string
};

type validationErrorType = {
    type: "ErrorValidation",
    name: string,
    email: string,
    password: string
};

type registerResponseType = {
    type: "ok" | "ErrorValidation" | "ErrorDataBaseOperation" | "duplicateEmail" | "wrongLogin",
    [p: string]: string
};

type statisticsToSaveResponseType = {
    type: "ok" | "error no such user" | "error";
};

type replayRestoreShipsPositions = {
    row: number,
    column: number,
    size: number,
    isVertical: boolean,
    hits: number
}[];

type replayRestoreAggeregateShipsPositionsType = {
    computerBoard: replayRestoreShipsPositions,
    playerBoard: replayRestoreShipsPositions
};

type replayMovesType = { row: number, column: number }[];

type replayGameInfoType = {
    date: string,
    result: "victory" | "defeat",
    duaration: string
    positionOfShips: replayRestoreAggeregateShipsPositionsType,
    moves: replayMovesType
};

type cellsStatesForRestore={state:"unTouched"|"hitButEmpty"|"exploaded" }[][];

type gameSnapShotToRestore={
    computerBoardCells:cellsStatesForRestore,
    playerBoardCells:cellsStatesForRestore,
    computerBoardShips:replayRestoreShipsPositions,
    playerBoardShips:replayRestoreShipsPositions,
    stateOfGame:gameStateEnum,
    computerHits:{ row: number, column: number }[][],
    arrayOfMoves:replayMovesType,
    time:number
};

type getGamesInfoForReplayResponseType = {
    type: "error" | "no statistics" | "no such user" | "ok",
    statInfo?: statisticsType
};

export type {statisticsType, validationErrorType, registerResponseType, userInfoFromLSType, replayRestoreAggeregateShipsPositionsType, replayRestoreShipsPositions, cellsStatesForRestore, gameSnapShotToRestore, replayMovesType, replayGameInfoType, statisticsToSaveResponseType, statisticsToSaveType, getGamesInfoForReplayResponseType, computerBoardEvent, playerBoardEvent };
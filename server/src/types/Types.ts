import {ObjectId} from "mongodb"

type statisticsType = {
    victories: number,
    defeats: number,
    gamesToReplayArray: replayGameInfoType[]
};

type emailType = `${string}@${string}.${string}`;

type passwordType = {
    hash: string,
    salt: string
};

type userInfoType = {
    _id?: string,
    name: string,
    date: Date
    email: emailType,
    password: passwordType,
    statistics: statisticsType
};

type userInfoTypeFromDb={
    _id?: ObjectId,
    name: string,
    date: Date
    email: emailType,
    password: passwordType,
    statistics: statisticsType
}

type userLoginType = {
    name: string,
    email: emailType,
    password: string
};

type validationErrorType = {
    type: "ErrorValidation",
    name: string,
    email: string,
    password: string
};

type registerRequestBodyType = {
    name: string,
    email: emailType,
    password: string
};

type registerResponseType ={type: "ok" | "ErrorDataBaseOperation" | "duplicateEmail"}|validationErrorType;

type loginRequestBodyType=registerRequestBodyType;

type loginResponseType={
    type: "ok" | "ErrorValidation" | "ErrorDataBaseOperation" | "wrongLogin",
    userId?: string
}|validationErrorType;

type replayShipsPositions = {
    row: number,
    column: number,
    size: number,
    isVertical: boolean
}[];

type replayAggeregateShipsPositionsType = {
    computerBoard: replayShipsPositions,
    playerBoard: replayShipsPositions
};

type replayMovesType = { row: number, column: number }[];

type replayGameInfoType = {
    date:string
    result:"victory"|"defeat",
    duaration:string,
    positionOfShips: replayAggeregateShipsPositionsType,
    moves: replayMovesType
};

type saveStatRequestBodyType = {
    userId: string,
    gameToReplay: replayGameInfoType
}

type saveStatResponseBodyType={
    type:"ok"|"error"|"error no such user"
}

type getGameInfoResponseBodyType={type:"error"}|{type:"no statistics"}|{type:"no such user"}|{type:"ok", statInfo:statisticsType};

export type { passwordType, emailType, userInfoType, statisticsType, validationErrorType, registerRequestBodyType, registerResponseType, userLoginType, replayGameInfoType, saveStatRequestBodyType, saveStatResponseBodyType, getGameInfoResponseBodyType, loginRequestBodyType, loginResponseType, userInfoTypeFromDb };

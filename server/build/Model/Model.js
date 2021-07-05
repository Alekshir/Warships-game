"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const Config_1 = __importDefault(require("./Config"));
const HashPassword_1 = require("../Helpers/HashPassword");
class Model {
    constructor() { }
    /**
     * gets MongoClient connection
     * @returns Promise<MongoClient>
     */
    async getConnection() {
        if (Model.client === null) {
            const client = new mongodb_1.MongoClient(Config_1.default.url, Config_1.default.options);
            await client.connect();
            Model.client = client;
            return Model.client;
        }
        else
            return Model.client;
    }
    /**
     * gets connection to the database.
     * @param name of the Data Base
     * @returns Promise<Db>
     */
    async getDataBase(name) {
        const clientMongoDb = await this.getConnection();
        let dataBase;
        if (clientMongoDb)
            return dataBase = clientMongoDb.db(name);
        else
            throw Error("MongoClient is undefined");
    }
    /**
     * When registarion happens, puts registration information in to the database.
     * @param userInfoObj - object with information about user.
     * @returns Promise<"ok" | "error" | "duplicateEmail">
     */
    async putRegisterInfoIntoDataBase(userInfoObj) {
        try {
            const dataBase = await this.getDataBase("usersDataBase");
            const checkForEmailDuplicates = await this.checkEmailForDuplicates(userInfoObj.email, dataBase); //cheks if this email was not used before.
            if (checkForEmailDuplicates)
                return "duplicateEmail";
            await dataBase.collection("usersCollection").insertOne(userInfoObj);
            //dataBase.collection("usersCollection").updateOne({ _id: "" }, { $set: { "statistics.victories": 0, "statistics.gamesToReplayArray": [] } });
        }
        catch (e) {
            console.log(e);
            return "error"; //error happened. Return this error.
        }
        return "ok"; //successful registration.
    }
    /**
     * checks if there are any duplicates of the given email.
     * @param email -amail to check for duplicates
     * @param dataBase -database to search for duplicates.
     * @returns Promise<boolean>
     */
    async checkEmailForDuplicates(email, dataBase) {
        return (await dataBase.collection("usersCollection").findOne({ email })) !== null;
    }
    /**
     * perform login process.
     * @param loginInfo - object with information for login.
     * @returns Promise<{ isLoginInfoCorrect: boolean, userId: string } | "error">
     */
    async login(loginInfo) {
        try {
            const dataBase = await this.getDataBase("usersDataBase");
            const user = await dataBase.collection("usersCollection").findOne({ email: loginInfo.email });
            if (user === null || user.name !== loginInfo.name)
                return { isLoginInfoCorrect: false, userId: "" };
            const salt = user.password.salt;
            const inputPassword = loginInfo.password;
            const hash = user.password.hash;
            const userId = user._id.toString();
            const isLoginInfoCorrect = HashPassword_1.checkPassword(inputPassword, salt, hash); //cheks if password is right.
            return { isLoginInfoCorrect, userId };
        }
        catch (e) {
            console.log(e);
            return "error"; //if an error happens, returns this error.
        }
    }
    /**
     * saves statistics of the game in to the database.
     * @param statInfo -object with statistics of the game.
     * @returns
     */
    async saveStat(statInfo) {
        try {
            const dataBase = await this.getDataBase("usersDataBase");
            let gameInfo = statInfo.gameToReplay;
            const resultField = (statInfo.gameToReplay.result === "victory") ?
                "statistics.victories" : "statistics.defeats";
            const userId = new mongodb_1.ObjectId(statInfo.userId); //create new object of user id.
            const result = await dataBase.collection("usersCollection").updateOne({ _id: userId }, {
                $push: { "statistics.gamesToReplayArray": gameInfo },
                $inc: { [resultField]: 1 }
            });
            if (result.modifiedCount === 1)
                return "ok";
            else
                return "error no such user";
        }
        catch (error) {
            console.log(error);
            return "error"; //if an error happens, returns this error.
        }
    }
    /**
     * gets statistics of the user from the database.
     * @param userId
     * @returns Promise<statisticsType | "no statistics" | "no such user" | "error">
     */
    async getStat(userId) {
        try {
            const dataBase = await this.getDataBase("usersDataBase");
            const userIdObj = new mongodb_1.ObjectId(userId);
            const result = await dataBase.collection("usersCollection").findOne({ _id: userIdObj }, { projection: { statistics: 1, _id: 0 } });
            if (result) {
                const gamesToReplay = result.statistics.gamesToReplayArray;
                if (gamesToReplay.length !== 0)
                    return result.statistics;
                else
                    return "no statistics";
            }
            else
                return "no such user";
        }
        catch (error) {
            console.log(error);
            return "error";
        }
        ;
    }
    /**
     * deletes statistics of the user
     * @param userId
     * @returns
     */
    async deleleteStatisticsOfTheUser(userId) {
        try {
            const dataBase = await this.getDataBase("usersDataBase");
            const userIdObj = new mongodb_1.ObjectId(userId); //create new object of user id.
            const result = await dataBase.collection("usersCollection").updateOne({ _id: userIdObj }, {
                $set: { "statistics": {
                        victories: 0,
                        defeats: 0,
                        gamesToReplayArray: []
                    } },
            });
            if (result.modifiedCount === 1)
                return "ok";
            else
                return "error no such user";
        }
        catch (error) {
            console.log(error);
            return "error"; //if an error happens, returns this error.
        }
    }
    /**
     * deletes user
     * @param userId
     * @returns
     */
    async deleteUser(userId) {
        try {
            const dataBase = await this.getDataBase("usersDataBase");
            const userIdObj = new mongodb_1.ObjectId(userId); //create new object of user id.
            const result = await dataBase.collection("usersCollection").deleteOne({ _id: userIdObj });
            if (result.deletedCount === 1)
                return "ok";
            else
                return "error no such user";
        }
        catch (error) {
            console.log(error);
            return "error"; //if an error happens, returns this error.
        }
    }
    /**
     * checks if the user with such email and name exists
     * @param name
     * @param email
     * @returns
     */
    async checkIfTheUserExist(name, email) {
        try {
            const dataBase = await this.getDataBase("usersDataBase");
            const result = await dataBase.collection("usersCollection").findOne({ $and: [{ name }, { email }] });
            if (result)
                return { id: result._id.toString() };
            else
                return "error no such user";
        }
        catch (error) {
            console.log(error);
            return "error"; //if an error happens, returns this error.
        }
    }
    /**
     * changes password of the user
     * @param userId
     * @param passwordObj
     * @returns
     */
    async changePassword(userId, passwordObj) {
        try {
            const dataBase = await this.getDataBase("usersDataBase");
            const userIdObj = new mongodb_1.ObjectId(userId); //create new object of user id.
            const result = await dataBase.collection("usersCollection").updateOne({ _id: userIdObj }, {
                $set: { "password": passwordObj },
            });
            if (result.modifiedCount === 1)
                return "ok";
            else
                return "error no such user";
        }
        catch (error) {
            console.log(error);
            return "error"; //if an error happens, returns this error.
        }
    }
}
Model.client = null;
const model = new Model();
exports.default = model;
//# sourceMappingURL=Model.js.map
import { Db, MongoClient, ObjectId } from 'mongodb';
import config from "./Config";
import { statisticsType, userInfoType, userInfoTypeFromDb, emailType, userLoginType, saveStatRequestBodyType, replayGameInfoType, passwordType } from "../types/Types";
import { checkPassword } from "../Helpers/HashPassword";

class Model {

    static client: MongoClient | null = null;

    constructor() { }

    /**
     * gets MongoClient connection
     * @returns Promise<MongoClient>
     */
    async getConnection():Promise<MongoClient> {
        if (Model.client === null) {

            const client: MongoClient = new MongoClient(config.url, config.options);
            await client.connect();
            Model.client = client;
            return Model.client;
        } else return Model.client;
    }

    /**
     * gets connection to the database.
     * @param name of the Data Base
     * @returns Promise<Db>
     */
    async getDataBase(name: string): Promise<Db> {
        const clientMongoDb = await this.getConnection();
        let dataBase: Db;

        if (clientMongoDb) return dataBase = clientMongoDb.db(name);
        else throw Error("MongoClient is undefined");
    }

    /**
     * When registarion happens, puts registration information in to the database.
     * @param userInfoObj - object with information about user.
     * @returns Promise<"ok" | "error" | "duplicateEmail">
     */
    async putRegisterInfoIntoDataBase(userInfoObj: userInfoType): Promise<"ok" | "error" | "duplicateEmail"> {

        try {
            const dataBase: Db = await this.getDataBase("usersDataBase");
            const checkForEmailDuplicates = await this.checkEmailForDuplicates(userInfoObj.email, dataBase);//cheks if this email was not used before.
            if (checkForEmailDuplicates) return "duplicateEmail";
            await dataBase.collection("usersCollection").insertOne(userInfoObj);
            //dataBase.collection("usersCollection").updateOne({ _id: "" }, { $set: { "statistics.victories": 0, "statistics.gamesToReplayArray": [] } });

        } catch (e) {
            console.log(e);
            return "error";//error happened. Return this error.
        }
        return "ok"; //successful registration.
    }

    /**
     * checks if there are any duplicates of the given email.
     * @param email -amail to check for duplicates
     * @param dataBase -database to search for duplicates.
     * @returns Promise<boolean>
     */
    async checkEmailForDuplicates(email: emailType, dataBase: Db):Promise<boolean> {
        return (await dataBase.collection("usersCollection").findOne({ email })) !== null;
    }

    /**
     * perform login process.
     * @param loginInfo - object with information for login.
     * @returns Promise<{ isLoginInfoCorrect: boolean, userId: string } | "error">
     */
    async login(loginInfo: userLoginType): Promise<{ isLoginInfoCorrect: boolean, userId: string } | "error"> {

        try {
            const dataBase: Db = await this.getDataBase("usersDataBase");
            const user: userInfoTypeFromDb = await dataBase.collection("usersCollection").findOne({ email: loginInfo.email });
            
            if (user === null || user.name !== loginInfo.name) return { isLoginInfoCorrect: false, userId: "" };

            const salt: string = user.password.salt;
            const inputPassword: string = loginInfo.password;
            const hash: string = user.password.hash;
            const userId: string = (user._id as ObjectId).toString();
            const isLoginInfoCorrect: boolean = checkPassword(inputPassword, salt, hash);//cheks if password is right.
            
            return { isLoginInfoCorrect, userId };

        } catch (e) {
            console.log(e);
            return "error"; //if an error happens, returns this error.
        }
    }

    /**
     * saves statistics of the game in to the database.
     * @param statInfo -object with statistics of the game.
     * @returns 
     */
    async saveStat(statInfo: saveStatRequestBodyType):Promise<"error" | "ok" | "error no such user">
    {
        try {
            const dataBase: Db = await this.getDataBase("usersDataBase");
            let gameInfo: replayGameInfoType = statInfo.gameToReplay;
            const resultField: "statistics.victories" | "statistics.defeats" = (statInfo.gameToReplay.result === "victory") ?
                "statistics.victories" : "statistics.defeats";

            const userId: ObjectId = new ObjectId(statInfo.userId);//create new object of user id.
            const result = await dataBase.collection("usersCollection").updateOne({ _id: userId },
                {
                    $push: { "statistics.gamesToReplayArray": gameInfo },
                    $inc: { [resultField]: 1 }
                }
            );

            if (result.modifiedCount === 1) return "ok";
            else return "error no such user";

        } catch (error) {
            console.log(error);
            return "error"; //if an error happens, returns this error.
        }
    }

    /**
     * gets statistics of the user from the database.
     * @param userId 
     * @returns Promise<statisticsType | "no statistics" | "no such user" | "error">
     */
    async getStat(userId: string):Promise<statisticsType | "no statistics" | "no such user" | "error">
    {
        try {
            const dataBase: Db = await this.getDataBase("usersDataBase");
            const userIdObj: ObjectId = new ObjectId(userId);

            const result = await dataBase.collection("usersCollection").findOne<{ statistics: statisticsType }>({ _id: userIdObj }, { projection: { statistics: 1, _id: 0 } });
            if (result) {
                const gamesToReplay = result.statistics.gamesToReplayArray;
                if (gamesToReplay.length !== 0) return result.statistics;
                else return "no statistics";

            } else return "no such user";
        } catch (error) {
            console.log(error);
            return "error";
        };
    }

    /**
     * deletes statistics of the user
     * @param userId 
     * @returns 
     */
    async deleleteStatisticsOfTheUser(userId:string):Promise<"ok"|"error no such user"|"error">{
        try {
            const dataBase: Db = await this.getDataBase("usersDataBase");

            const userIdObj: ObjectId = new ObjectId(userId);//create new object of user id.
            const result = await dataBase.collection("usersCollection").updateOne({ _id: userIdObj },
                {
                    $set: { "statistics": { 
                        victories: 0, 
                        defeats: 0, 
                        gamesToReplayArray: [] 
                    } },  
                }
            );

            if (result.modifiedCount === 1) return "ok";
            else return "error no such user";

        } catch (error) {
            console.log(error);
            return "error"; //if an error happens, returns this error.
        }
    }

    /**
     * deletes user
     * @param userId 
     * @returns 
     */
    async deleteUser(userId:string):Promise<"ok"|"error no such user"|"error">{
        try {
            const dataBase: Db = await this.getDataBase("usersDataBase");

            const userIdObj: ObjectId = new ObjectId(userId);//create new object of user id.
            const result = await dataBase.collection("usersCollection").deleteOne({ _id: userIdObj });

            if (result.deletedCount === 1) return "ok";
            else return "error no such user";

        } catch (error) {
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
    async checkIfTheUserExist(name:string, email:string):Promise<"error no such user" | "error" | {id: string;}>
    {
        try {
            const dataBase: Db = await this.getDataBase("usersDataBase");

            const result:userInfoTypeFromDb = await dataBase.collection("usersCollection").findOne({$and:[{name}, {email}] });

            if (result) return {id:(result._id as ObjectId).toString()};
            else return "error no such user";

        } catch (error) {
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
    async changePassword (userId:string, passwordObj:passwordType):Promise<"ok" | "error no such user" | "error"> {
        try {
            const dataBase: Db = await this.getDataBase("usersDataBase");
            const userIdObj: ObjectId = new ObjectId(userId);//create new object of user id.
            const result = await dataBase.collection("usersCollection").updateOne({ _id: userIdObj },
                {
                    $set: { "password":passwordObj },  
                }
            );

            if (result.modifiedCount === 1) return "ok";
            else return "error no such user";

        } catch (error) {
            console.log(error);
            return "error"; //if an error happens, returns this error.
        }
    }
}

const model = new Model();

export default model;
//import * as express from "express"; //when we use later express() /@types/express shouts about an erro.
import express from "express";
//const express=require('express'); //if we use require we can not use types.
import { Request, Response } from "express";
import * as path from "path";
import validation from "./Helpers/Validation";
import { hashPassword } from "./Helpers/HashPassword";
import { encrypt, decrypt } from "./Helpers/EncryptDecrypt";
import model from "./Model/Model";
import sendMail from "./Helpers/Mailer";
import { userInfoType, passwordType, validationErrorType, registerRequestBodyType, registerResponseType, userLoginType, saveStatRequestBodyType, saveStatResponseBodyType, getGameInfoResponseBodyType, loginRequestBodyType, loginResponseType } from "./types/Types";

let temp: {//object to check restoring password
    [p: string]: {iv:Uint8Array|null, time:number|null}, // vector which was used to chipher user's id. [p: string] - encrypted user's id.
} = {};

const app = express();

const { PORT = 3000 } = process.env;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

/**
 * registration (calls from RegisterForm)
 */
app.put('/register', async (req: Request<{}, registerResponseType, registerRequestBodyType>, res: Response<registerResponseType>) => {
    const validationResult: true | validationErrorType = validation(req.body);//validate registration input information.
    if (validationResult === true) {
        const { hash, salt } = hashPassword(req.body.password);
        const passwordObj: passwordType = { hash, salt };

        const userInfoObj: userInfoType = {
            name: req.body.name,
            date: new Date(),
            email: req.body.email,
            password: passwordObj,
            statistics: {
                victories: 0,
                defeats: 0,
                gamesToReplayArray: []
            }
        };
        const result = await model.putRegisterInfoIntoDataBase(userInfoObj);//call model
        if (result === "error") {
            const errorInDataBaseOperation: registerResponseType = { type: "ErrorDataBaseOperation" };
            res.json(errorInDataBaseOperation);
        } else if (result === "duplicateEmail") {
            res.json({ type: "duplicateEmail" });
        } else {//success
            try {
                sendMail("Warship Game, Registration", "Congtatulation! You are registered in the WarShip Game", "<b>Congtatulation! You are registered in the Warship game.</b>", req.body.email).then((_) => res.json({ type: "ok" }));//send mail and respond "ok" to client
            } catch (error) { console.log(error) }
        }
    } else res.json(validationResult);//if validation error, respond this error to client.
});

/**
 * login (calls from LoginForm)
 */
app.post('/login', async (req: Request<{}, loginResponseType, loginRequestBodyType>, res: Response<loginResponseType>) => {
    const validationResult: true | validationErrorType = validation(req.body);//server validation

    if (validationResult === true) {
        const userLogInIfo: userLoginType = { name: req.body.name, email: req.body.email, password: req.body.password };
        const result = await model.login(userLogInIfo);

        if (result === "error") {
            const errorInDataBaseOperation: loginResponseType = { type: "ErrorDataBaseOperation" };
            res.json(errorInDataBaseOperation);
        }
        else if (result.isLoginInfoCorrect === true) {
            try {
                sendMail("Warship logged in", "You are logged in Warship Game", "<b>Congratulation you are logged in Warship game!</b>", req.body.email).then((_) => res.json({ type: "ok", userId: result.userId })).catch((error) => console.log(error));
            } catch (error) { console.log(error); }
        } else res.json({ type: "wrongLogin" });
    } else res.json(validationResult);//responding information about validation error.
});

/**
 * save sttatistics of the user (calls from Game.saveGameInfoForReplay)
 */
app.put('/saveStat', async (req: Request<{}, saveStatResponseBodyType, saveStatRequestBodyType>, res: Response<saveStatResponseBodyType>) => {

    const statInfo: saveStatRequestBodyType = req.body;
    const result = await model.saveStat(statInfo);
    if (result === "ok") res.json({ type: "ok" })
    else if (result === "error no such user") res.json({ type: "error no such user" });
    else res.json({ type: "error" });
});

/**
 * gets game information of the user (calls from Menu.getStatistics)
 */
app.get("/getGamesInfo", async (req: Request<{}, getGameInfoResponseBodyType, {}, { userId: string }>, res: Response<getGameInfoResponseBodyType>) => {
    const result = await model.getStat(req.query.userId);
    if (result === "error") res.json({ type: "error" });
    else if (result === "no statistics") res.json({ type: "no statistics" });
    else if (result === "no such user") res.json({ type: "no such user" });
    else res.json({ type: "ok", statInfo: result });
});


/**
 * delete all statistics of the user (calls from Statistics  delStatMenuYesBtn.addEventListener("click")
 */
app.delete("/deleteStatistics", async (req: Request<{}, { type: "no such user" | "error" | "ok" }, { userId: string }>, res: Response<{ type: "no such user" | "error" | "ok" }>) => {
    
    const result: "ok" | "error no such user" | "error" = await model.deleleteStatisticsOfTheUser(req.body.userId);

    if (result === "error no such user") res.json({ type: "no such user" });
    else if (result === "error") res.json({ type: "error" });
    else res.json({ type: "ok" });
});

/**
 * deletes registration of the user (calls from Menu.makeAction)
 */
app.delete("/deleteUser", async (req: Request<{}, { type: "no such user" | "error" | "ok" }, { userId: string }>, res: Response<{ type: "no such user" | "error" | "ok" }>) => {
    
    const result: "ok" | "error no such user" | "error" = await model.deleteUser(req.body.userId);

    if (result === "error no such user") res.json({ type: "no such user" });
    else if (result === "error") res.json({ type: "error" });
    else res.json({ type: "ok" });
});


/**
 * restore password if user does not remember it. Calls from AbstractForm.addEventsToSubbmitButton
 */
app.post("/restorePassword", async (req: Request<{}, { type: "no such user" | "error" | "ok" }, { name: string, email: `${string}@${string}.${string}`, web: string }>, res: Response<{ type: "no such user" | "error" | "ok" }>) => {
   
    const name = req.body.name, email = req.body.email;
    const result: { id: string } | "error no such user" | "error" = await model.checkIfTheUserExist(name, email);
    if (result === "error no such user") res.json({ type: "no such user" });
    else if (result === "error") res.json({ type: "error" });
    else {
        const encruptIdObj = await encrypt(result.id);
        temp[encruptIdObj.encrypted]={iv:null, time:null};
        temp[encruptIdObj.encrypted].iv = encruptIdObj.iv;
        temp[encruptIdObj.encrypted].time = Date.now();
        
        const link = `<a href="${req.body.web}/changePassWord?user=${encruptIdObj.encrypted}">to restore your password follow this link</a>`;
        try {
            sendMail("Warship restore password", "To restore your password", `<b>${link}`, req.body.email).then((_) => res.json({ type: "ok" })).catch((error) => console.log(error));
        } catch (error) { console.log(error); }
    }
});

/**
 * when user does not remember password and whant to chage it following link which was sent to the user's email.
 * shows form to restore the pasword.
 */
app.get('/changePassWord', function (req:Request<{},{}, {}, {user:string}>, res) {
    //if no such user in temp (link was used before) and check that Date.now - prev Date.now <300 000
    if(!(temp[req.query.user])||(Date.now()-(temp[req.query.user].time as number)>300000)) res.sendFile(path.join(__dirname, '/public/indexPassWordLinkDisabled.html'));
    else res.sendFile(path.join(__dirname, '/public/indexPassWord.html'));
});


/**
 * change old password for the new one. (calls from RestorePassword.fetchData)
 */
app.put('/newPassword', async function (req: Request<{}, { type: "ok" | "no such user" | "error" }, { userId: string, password: string }>, res: Response<{ type: "ok" | "no such user" | "error" }>) {
    const decryptedUserId = await decrypt(req.body.userId, temp[req.body.userId].iv as Uint8Array );
    temp={};
    const { hash, salt } = hashPassword(req.body.password);
    const passwordObj: passwordType = { hash, salt };
    const result: "ok" | "error no such user" | "error" = await model.changePassword(decryptedUserId, passwordObj);
    if (result === "ok") res.json({ type: "ok" });
    else if (result === "error no such user") res.json({ type: "no such user" });
    else if (result === "error") res.json({ type: "error" });
});

/**
 * all other requests shows standard game
 */
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(PORT, () => console.log('server started!!!3333' + __dirname));


export { };
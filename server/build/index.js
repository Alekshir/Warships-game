"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import * as express from "express"; //when we use later express() /@types/express shouts about an erro.
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const Validation_1 = __importDefault(require("./Helpers/Validation"));
const HashPassword_1 = require("./Helpers/HashPassword");
const EncryptDecrypt_1 = require("./Helpers/EncryptDecrypt");
const Model_1 = __importDefault(require("./Model/Model"));
const Mailer_1 = __importDefault(require("./Helpers/Mailer"));
let temp = {};
const app = express_1.default();
const { PORT = 3000 } = process.env;
app.use(express_1.default.static(path.join(__dirname, 'public')));
app.use(express_1.default.json());
/**
 * registration (calls from RegisterForm)
 */
app.put('/register', async (req, res) => {
    const validationResult = Validation_1.default(req.body); //validate registration input information.
    if (validationResult === true) {
        const { hash, salt } = HashPassword_1.hashPassword(req.body.password);
        const passwordObj = { hash, salt };
        const userInfoObj = {
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
        const result = await Model_1.default.putRegisterInfoIntoDataBase(userInfoObj); //call model
        if (result === "error") {
            const errorInDataBaseOperation = { type: "ErrorDataBaseOperation" };
            res.json(errorInDataBaseOperation);
        }
        else if (result === "duplicateEmail") {
            res.json({ type: "duplicateEmail" });
        }
        else { //success
            try {
                Mailer_1.default("Warship Game, Registration", "Congtatulation! You are registered in the WarShip Game", "<b>Congtatulation! You are registered in the Warship game.</b>", req.body.email).then((_) => res.json({ type: "ok" })); //send mail and respond "ok" to client
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    else
        res.json(validationResult); //if validation error, respond this error to client.
});
/**
 * login (calls from LoginForm)
 */
app.post('/login', async (req, res) => {
    const validationResult = Validation_1.default(req.body); //server validation
    if (validationResult === true) {
        const userLogInIfo = { name: req.body.name, email: req.body.email, password: req.body.password };
        const result = await Model_1.default.login(userLogInIfo);
        if (result === "error") {
            const errorInDataBaseOperation = { type: "ErrorDataBaseOperation" };
            res.json(errorInDataBaseOperation);
        }
        else if (result.isLoginInfoCorrect === true) {
            try {
                Mailer_1.default("Warship logged in", "You are logged in Warship Game", "<b>Congratulation you are logged in Warship game!</b>", req.body.email).then((_) => res.json({ type: "ok", userId: result.userId })).catch((error) => console.log(error));
            }
            catch (error) {
                console.log(error);
            }
        }
        else
            res.json({ type: "wrongLogin" });
    }
    else
        res.json(validationResult); //responding information about validation error.
});
/**
 * save sttatistics of the user (calls from Game.saveGameInfoForReplay)
 */
app.put('/saveStat', async (req, res) => {
    const statInfo = req.body;
    const result = await Model_1.default.saveStat(statInfo);
    if (result === "ok")
        res.json({ type: "ok" });
    else if (result === "error no such user")
        res.json({ type: "error no such user" });
    else
        res.json({ type: "error" });
});
/**
 * gets game information of the user (calls from Menu.getStatistics)
 */
app.get("/getGamesInfo", async (req, res) => {
    const result = await Model_1.default.getStat(req.query.userId);
    if (result === "error")
        res.json({ type: "error" });
    else if (result === "no statistics")
        res.json({ type: "no statistics" });
    else if (result === "no such user")
        res.json({ type: "no such user" });
    else
        res.json({ type: "ok", statInfo: result });
});
/**
 * delete all statistics of the user (calls from Statistics  delStatMenuYesBtn.addEventListener("click")
 */
app.delete("/deleteStatistics", async (req, res) => {
    const result = await Model_1.default.deleleteStatisticsOfTheUser(req.body.userId);
    if (result === "error no such user")
        res.json({ type: "no such user" });
    else if (result === "error")
        res.json({ type: "error" });
    else
        res.json({ type: "ok" });
});
/**
 * deletes registration of the user (calls from Menu.makeAction)
 */
app.delete("/deleteUser", async (req, res) => {
    const result = await Model_1.default.deleteUser(req.body.userId);
    if (result === "error no such user")
        res.json({ type: "no such user" });
    else if (result === "error")
        res.json({ type: "error" });
    else
        res.json({ type: "ok" });
});
/**
 * restore password if user does not remember it. Calls from AbstractForm.addEventsToSubbmitButton
 */
app.post("/restorePassword", async (req, res) => {
    const name = req.body.name, email = req.body.email;
    const result = await Model_1.default.checkIfTheUserExist(name, email);
    if (result === "error no such user")
        res.json({ type: "no such user" });
    else if (result === "error")
        res.json({ type: "error" });
    else {
        const encruptIdObj = await EncryptDecrypt_1.encrypt(result.id);
        temp[encruptIdObj.encrypted] = { iv: null, time: null };
        temp[encruptIdObj.encrypted].iv = encruptIdObj.iv;
        temp[encruptIdObj.encrypted].time = Date.now();
        const link = `<a href="${req.body.web}/changePassWord?user=${encruptIdObj.encrypted}">to restore your password follow this link</a>`;
        try {
            Mailer_1.default("Warship restore password", "To restore your password", `<b>${link}`, req.body.email).then((_) => res.json({ type: "ok" })).catch((error) => console.log(error));
        }
        catch (error) {
            console.log(error);
        }
    }
});
/**
 * when user does not remember password and whant to chage it following link which was sent to the user's email.
 * shows form to restore the pasword.
 */
app.get('/changePassWord', function (req, res) {
    //if no such user in temp (link was used before) and check that Date.now - prev Date.now <300 000
    if (!(temp[req.query.user]) || (Date.now() - temp[req.query.user].time > 300000))
        res.sendFile(path.join(__dirname, '/public/indexPassWordLinkDisabled.html'));
    else
        res.sendFile(path.join(__dirname, '/public/indexPassWord.html'));
});
/**
 * change old password for the new one. (calls from RestorePassword.fetchData)
 */
app.put('/newPassword', async function (req, res) {
    const decryptedUserId = await EncryptDecrypt_1.decrypt(req.body.userId, temp[req.body.userId].iv);
    temp = {};
    const { hash, salt } = HashPassword_1.hashPassword(req.body.password);
    const passwordObj = { hash, salt };
    const result = await Model_1.default.changePassword(decryptedUserId, passwordObj);
    if (result === "ok")
        res.json({ type: "ok" });
    else if (result === "error no such user")
        res.json({ type: "no such user" });
    else if (result === "error")
        res.json({ type: "error" });
});
/**
 * all other requests shows standard game
 */
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});
app.listen(PORT, () => console.log('server started!!!3333' + __dirname));
//# sourceMappingURL=index.js.map
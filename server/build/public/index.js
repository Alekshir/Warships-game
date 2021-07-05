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
const app = express_1.default();
const { PORT = 3000 } = process.env;
console.log(__dirname);
app.use(express_1.default.static(path.join(__dirname, 'public')));
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.listen(PORT, () => console.log('server started!!!' + __dirname));
//# sourceMappingURL=index.js.map
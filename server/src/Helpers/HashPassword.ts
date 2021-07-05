import * as crypto from "crypto";

const hashPassword=(password:string):{salt:string, hash:string}=>{
    const salt= crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
    return {salt, hash};
}

const checkPassword=(password:string, salt:string, hash:string):boolean=>{
    return crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`)===hash;
}

export {hashPassword,checkPassword};
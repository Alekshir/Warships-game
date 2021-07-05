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
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto = __importStar(require("crypto"));
const { scrypt, randomFill, createCipheriv, createDecipheriv } = crypto;
/**
 * encrypt text
 * @param text
 * @returns Promise<{encrypted:string, iv:Uint8Array}>
 */
const encrypt = (text) => {
    return new Promise((resolve, reject) => {
        const algorithm = 'aes-192-cbc';
        const password = 'Password used to generate key';
        scrypt(password, 'salt', 24, (err, key) => {
            if (err)
                reject(err);
            // Then, we'll generate a random initialization vector
            randomFill(new Uint8Array(16), (err, iv) => {
                if (err)
                    reject(err);
                // Once we have the key and iv, we can create and use the cipher...
                const cipher = createCipheriv(algorithm, key, iv);
                let encrypted = '';
                cipher.setEncoding('hex');
                cipher.on('data', (chunk) => encrypted += chunk);
                cipher.on('end', () => {
                    //console.log(encrypted);
                    resolve({ encrypted, iv: iv });
                });
                cipher.write(text);
                cipher.end();
            });
        });
    });
};
exports.encrypt = encrypt;
/**
 * decrypt encrypted text with given iv
 * @param text
 * @param iv
 * @returns Promise<string>
 */
const decrypt = (text, iv) => {
    return new Promise((resolve, reject) => {
        const algorithm = 'aes-192-cbc';
        const password = 'Password used to generate key';
        scrypt(password, 'salt', 24, (err, key) => {
            if (err)
                reject(err);
            const decipher = createDecipheriv(algorithm, key, iv);
            let decrypted = '';
            let chunk;
            decipher.on('readable', () => {
                while (null !== (chunk = decipher.read())) {
                    decrypted += chunk.toString('utf8');
                }
            });
            decipher.on('end', () => {
                resolve(decrypted);
            });
            decipher.write(text, 'hex');
            decipher.end();
        });
    });
};
exports.decrypt = decrypt;
//# sourceMappingURL=EncryptDecrypt.js.map
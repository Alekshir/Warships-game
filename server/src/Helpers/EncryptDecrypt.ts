import * as crypto from "crypto";

const {
    scrypt,
    randomFill,
    createCipheriv,
    createDecipheriv
} = crypto;


/**
 * encrypt text
 * @param text 
 * @returns Promise<{encrypted:string, iv:Uint8Array}>
 */
const encrypt = (text: string):Promise<{encrypted:string, iv:Uint8Array}> => {

    return new Promise<{encrypted:string, iv:Uint8Array}>((resolve, reject) => {

        const algorithm = 'aes-192-cbc';
        const password = 'Password used to generate key';

        scrypt(password, 'salt', 24, (err, key) => {
            if (err) reject(err);
            // Then, we'll generate a random initialization vector
            randomFill(new Uint8Array(16), (err, iv) => {
                if (err) reject(err);

                // Once we have the key and iv, we can create and use the cipher...
                const cipher = createCipheriv(algorithm, key, iv);

                let encrypted = '';
                cipher.setEncoding('hex');

                cipher.on('data', (chunk) => encrypted += chunk);
                cipher.on('end', () => {
                    //console.log(encrypted);
                    resolve({encrypted, iv:iv});
                });

                cipher.write(text);
                cipher.end();
            });
        });
    });
}

/**
 * decrypt encrypted text with given iv
 * @param text 
 * @param iv 
 * @returns Promise<string>
 */
const decrypt = (text: string, iv:Uint8Array):Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const algorithm = 'aes-192-cbc';
        const password = 'Password used to generate key';
        
        scrypt(password, 'salt', 24, (err, key) => {
            if (err) reject(err);
            
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
}

export { encrypt, decrypt };
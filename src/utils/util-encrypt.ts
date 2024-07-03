import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment'; 
const secretKey: any = environment.encryptSecretKey;

export const encrypt = (data: any) => {
    return CryptoJS.AES.encrypt(data, secretKey).toString();
};

export const decrypt = (valueEncrypt: any) => {
    const valueDecrypt = CryptoJS.AES.decrypt(valueEncrypt, secretKey).toString(CryptoJS.enc.Utf8);
    if (!valueDecrypt) {
        return null;
    }
    return JSON.parse(valueDecrypt);
};
import { ethers, Signer } from "ethers";
import * as fs from 'fs';
require('dotenv').config();
export function getRinkebySigner(): Signer {
    // import file .secret and read it
    const url = process.env.RINKEBY_URL;
    const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
    const privateKey = process.env.PRIVATE_KEY || '';
    return new ethers.Wallet(privateKey, customHttpProvider);
}
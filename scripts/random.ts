import { ethers, Signer } from "ethers";
import * as fs from 'fs';
require('dotenv').config();



async function main() {
    const maxBigNumber = (ethers.constants.MaxUint256);
    const minBigNumber = (ethers.constants.Zero);
    console.log("maxBigNumber:", maxBigNumber.toString());
    console.log("minBigNumber:", minBigNumber.toString());
    console.log("length:", maxBigNumber.toString().length);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

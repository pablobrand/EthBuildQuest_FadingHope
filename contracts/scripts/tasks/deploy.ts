import { ethers } from "hardhat";

import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";

task("deploy-all", "Deploys and verifies contracts")
    .setAction(async (_, hre) => {
        await hre.run("deploy")
        await hre.run("etherscan-verify")
    });
    
export { }


// async function main() {
//   // Hardhat always runs the compile task when running scripts with its command
//   // line interface.
//   //
//   // If this script is run directly using `node` you may want to call compile
//   // manually to make sure everything is compiled
//   // await hre.run('compile');

//   const owner = (await ethers.getSigners())[0];
//   console.log("signer address: ", owner.address);

//   const masterContract = await (await ethers.getContractFactory("MasterContract")).deploy();

//   // We get the contract to deploy
//   const KingdomNFT = await ethers.getContractFactory("KingdomNFT");
//   const kingdom = await KingdomNFT.deploy(masterContract.address);
//   await kingdom.deployed();
//   console.log("kingdom deployed to:", kingdom.address);
//   console.log("master deployed to:", masterContract.address);
// }

// // We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

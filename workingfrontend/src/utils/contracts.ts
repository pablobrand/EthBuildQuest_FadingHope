/* eslint-disable camelcase */
import { BigNumber, ethers } from "ethers";
// import * as fs from 'fs';

import * as config from "./GameConfigBuilding.json";
import { FadingHopeToken, FadingHopeToken__factory, KingdomNFT, KingdomNFT__factory, MasterContract, MasterContract__factory } from "./typechain";
// deploying "FadingHopeToken"  0xa187379BEF6DFdCa436115d1804A83C823FB4B99 with 2235903 gas
// deploying "KingdomNFT" 0x495392ec53Ea7FcdF1f497f1Eaf68401224d6eEa with 4188863 gas
// deploying "MasterContract" 0xA0B434f834b7fa9CD4d28923E6f56a9035F52604 with 2620095 gas

// Rinkeby
// deployer address: 0x9c9242F46692c0D3d262Cc3247c33359755Fd228
// reusing "FadingHopeToken" at 0xBF7B4BCDAB40801AFD72dd49A8f6E2FB6E89fbEb
// reusing "KingdomNFT" at 0xa9950C6D08D960b4cEE0A22DFbC64dDC8BD37856
// reusing "MasterContract" at 0x8cd9f5124C3BB6D21730Eb01c94f1650913352c4

// export const fadingHopeAddress = "0xa187379BEF6DFdCa436115d1804A83C823FB4B99";
// export const kingdomNFTAddress = "0x495392ec53Ea7FcdF1f497f1Eaf68401224d6eEa";
// export const masterContractAddress = "0xA0B434f834b7fa9CD4d28923E6f56a9035F52604";


// rinkeby address
import { default as rinkeby_token } from "./deployments/rinkeby/FadingHopeToken.json";
import { default as rinkeby_kingdom } from "./deployments/rinkeby/KingdomNFT.json";
import { default as rinkeby_master } from "./deployments/rinkeby/MasterContract.json";
// ropsten address
import { default as ropsten_token } from "./deployments/ropsten/FadingHopeToken.json";
import { default as ropsten_kingdom } from "./deployments/ropsten/KingdomNFT.json";
import { default as ropsten_master } from "./deployments/ropsten/MasterContract.json";
// okovan address. Optimism L2 kovan test net
import { default as okovan_token } from "./deployments/okovan/FadingHopeToken.json";
import { default as okovan_kingdom } from "./deployments/okovan/KingdomNFT.json";
import { default as okovan_master } from "./deployments/okovan/MasterContract.json";
// mumbai address polygon testnet
import { default as mumbai_token } from "./deployments/mumbai/FadingHopeToken.json";
import { default as mumbai_kingdom } from "./deployments/mumbai/KingdomNFT.json";
import { default as mumbai_master } from "./deployments/mumbai/MasterContract.json";

interface BuildingCost {
    level: number;
    TownCost: BigNumber;
    IncomePerSec: BigNumber;
    BarrackCost: BigNumber;
    WallCost: BigNumber;
}
class GameConfig {
    buildingLevelConfig: Record<number, BuildingCost> = {};
    GetBuildingConfig(level: number): BuildingCost {
        return this.buildingLevelConfig[level];
    }
}

export function GetGameConfig(): GameConfig {
    // reading GameConfigBuilding.json file
    // convert json file to class
    const gc = new GameConfig();
    const array = config;
    for (let i = 0; i < array.length; i++) {
        const bc: BuildingCost = {
            level: array[i].Lv as number,
            TownCost: BigNumber.from(array[i].TownCost),
            IncomePerSec: BigNumber.from(array[i].IncomePerSec),
            BarrackCost: BigNumber.from(array[i].BarrackCost),
            WallCost: BigNumber.from(array[i].WallCost),
        };
        gc.buildingLevelConfig[bc.level] = bc;
    }
    return gc;
}

export function GetTownCenterCostArray(): BigNumber[] {
    const gc = GetGameConfig();
    const buildings = Object.values(gc.buildingLevelConfig);
    const arr = buildings.map(k => k.TownCost);
    return arr;
}

export function GetBarracksCostArray(): BigNumber[] {
    const gc = GetGameConfig();
    const buildings = Object.values(gc.buildingLevelConfig);
    const arr = buildings.map(k => k.BarrackCost);
    return arr;
}

export function GetIncomeArray(): BigNumber[] {
    const gc = GetGameConfig();
    const buildings = Object.values(gc.buildingLevelConfig);
    const arr = buildings.map(k => k.IncomePerSec);
    return arr;
}


export async function GetContracts(network: string): Promise<[ethers.providers.JsonRpcSigner, MasterContract, FadingHopeToken, KingdomNFT]> {
    // let window: any;
    // const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any");
    // Prompt user for account connections
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    console.log("Account:", await signer.getAddress());

    let fadingHopeAddress = "";
    let kingdomNFTAddress = "";
    let masterContractAddress = "";
    switch (network) {
        case "okovan":
            fadingHopeAddress = okovan_token.address;
            kingdomNFTAddress = okovan_kingdom.address;
            masterContractAddress = okovan_master.address;
            break;
        case "mumbai":
            fadingHopeAddress = mumbai_token.address;
            kingdomNFTAddress = mumbai_kingdom.address;
            masterContractAddress = mumbai_master.address;
            break;
        case "rinkeby":
            fadingHopeAddress = rinkeby_token.address;
            kingdomNFTAddress = rinkeby_kingdom.address;
            masterContractAddress = rinkeby_master.address;
            break;
        case "ropsten":
            fadingHopeAddress = ropsten_token.address;
            kingdomNFTAddress = ropsten_kingdom.address;
            masterContractAddress = ropsten_master.address;
            break;
        default: // rinkeby
            fadingHopeAddress = rinkeby_token.address;
            kingdomNFTAddress = rinkeby_kingdom.address;
            masterContractAddress = rinkeby_master.address;
            break;
    }

    const token = FadingHopeToken__factory.connect(fadingHopeAddress, signer);
    const kingdom = KingdomNFT__factory.connect(kingdomNFTAddress, signer);
    const master = MasterContract__factory.connect(masterContractAddress, signer);

    return [signer, master, token, kingdom];
}

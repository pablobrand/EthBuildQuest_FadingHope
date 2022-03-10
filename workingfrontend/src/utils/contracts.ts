import { BigNumber, ethers } from "ethers";
// import * as fs from 'fs';

import * as config from './GameConfigBuilding.json';
import { FadingHopeToken, FadingHopeToken__factory, KingdomNFT, KingdomNFT__factory, MasterContract, MasterContract__factory } from "./typechain";
// deploying "FadingHopeToken"  0xa187379BEF6DFdCa436115d1804A83C823FB4B99 with 2235903 gas
// deploying "KingdomNFT" 0x495392ec53Ea7FcdF1f497f1Eaf68401224d6eEa with 4188863 gas
// deploying "MasterContract" 0xA0B434f834b7fa9CD4d28923E6f56a9035F52604 with 2620095 gas
export const fadingHopeAddress = "0xa187379BEF6DFdCa436115d1804A83C823FB4B99";
export const kingdomNFTAddress = "0x495392ec53Ea7FcdF1f497f1Eaf68401224d6eEa";
export const masterContractAddress = "0xA0B434f834b7fa9CD4d28923E6f56a9035F52604";


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


export async function GetContracts(): Promise<[ethers.providers.JsonRpcSigner,MasterContract, FadingHopeToken, KingdomNFT]> {
    // let window: any;
    // const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const provider = new ethers.providers.Web3Provider((window as any).ethereum , "any");
    // Prompt user for account connections
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    console.log("Account:", await signer.getAddress());

    const token = FadingHopeToken__factory.connect(fadingHopeAddress, signer);
    const kingdom = KingdomNFT__factory.connect(kingdomNFTAddress, signer);
    const master = MasterContract__factory.connect(masterContractAddress, signer);
    return [signer,master, token, kingdom];
}

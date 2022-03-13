import { BigNumber } from "ethers";
import { int } from "hardhat/internal/core/params/argumentTypes";
import * as fs from 'fs';

import { ethers } from "hardhat";
import { FadingHopeToken, KingdomNFT, MasterContract } from "../typechain";
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

    const file = './scripts/GameConfigBuilding.json';
    const jsonString = fs.readFileSync(file, 'utf8');
    const json = JSON.parse(jsonString);
    for (let i = 0; i < json.length; i++) {
        const bc: BuildingCost = {
            level: json[i].Lv,
            TownCost: BigNumber.from(json[i].TownCost),
            IncomePerSec: BigNumber.from(json[i].IncomePerSec),
            BarrackCost: BigNumber.from(json[i].BarrackCost),
            WallCost: BigNumber.from(json[i].WallCost),
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

export async function DeployMasterContract(owner: string): Promise<[MasterContract, FadingHopeToken, KingdomNFT]> {

    const Factory = await ethers.getContractFactory("FadingHopeToken");
    const token = await Factory.deploy();
    await token.deployed();

    const Kingdom = await ethers.getContractFactory("KingdomNFT");
    const kingdom = await Kingdom.deploy(owner);
    await kingdom.deployed();

    const Master = await ethers.getContractFactory("MasterContract");
    const master = await Master.deploy(token.address, kingdom.address);
    await master.deployed();

    await token.grantRole(await token.MINTER_ROLE(), master.address, { gasLimit: 1000000 });
    await kingdom.grantRole(await kingdom.ADMIN_ROLE(), master.address, { gasLimit: 1000000 });

    await master.SetBuildingCost(0, GetTownCenterCostArray());
    await master.SetBuildingCost(1, GetBarracksCostArray());
    await master.SetTownCenterIncome(GetIncomeArray());

    return [master, token, kingdom];
}

export async function AttachAndSetupMasterContract(tokenAddress: string, kingdomAddress: string, masterAddress: string): Promise<[MasterContract, FadingHopeToken, KingdomNFT]> {

    const Factory = await ethers.getContractFactory("FadingHopeToken");
    const token = Factory.attach(tokenAddress);
    await token.deployed();

    const Kingdom = await ethers.getContractFactory("KingdomNFT");
    const kingdom = Kingdom.attach(kingdomAddress);
    await kingdom.deployed();

    const Master = await ethers.getContractFactory("MasterContract");
    const master = Master.attach(masterAddress);
    await master.deployed();

    console.log("grant role")

    await token.grantRole(await token.MINTER_ROLE(), master.address, { gasLimit: 1000000 });
    await (await kingdom.grantRole(await kingdom.ADMIN_ROLE(), master.address, { gasLimit: 1000000 })).wait();

    console.log("master mint role:", await token.hasRole(await token.MINTER_ROLE(), master.address));
    console.log("master admin role:", await kingdom.hasRole(await kingdom.ADMIN_ROLE(), master.address));
    console.log("setup building cost")
    await master.SetBuildingCost(0, GetTownCenterCostArray());
    await master.SetBuildingCost(1, GetBarracksCostArray());
    await master.SetTownCenterIncome(GetIncomeArray());

    console.log("building lv 10 cost:", await master.getBuildingCost(0, 10));
    console.log("building lv 10 cost:", await master.getBuildingCost(1, 10));
    console.log("test incom lv 6:", await master.calculateTownIncome(6, 10000))


    return [master, token, kingdom];
}
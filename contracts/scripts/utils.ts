import { BigNumber } from "ethers";
import { int } from "hardhat/internal/core/params/argumentTypes";
import * as fs from 'fs';

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

export function GetTownCenterCostArray(): BigNumber[]{
    const gc = GetGameConfig();
    const buildings = Object.values(gc.buildingLevelConfig);
    const arr = buildings.map(k => k.TownCost);
    return arr;
}

export function GetBarracksCostArray(): BigNumber[]{
    const gc = GetGameConfig();
    const buildings = Object.values(gc.buildingLevelConfig);
    const arr = buildings.map(k => k.BarrackCost);
    return arr;
}

export function GetIncomeArray(): BigNumber[]{
    const gc = GetGameConfig();
    const buildings = Object.values(gc.buildingLevelConfig);
    const arr = buildings.map(k => k.IncomePerSec);
    return arr;
}
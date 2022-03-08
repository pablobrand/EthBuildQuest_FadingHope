import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { FadingHopeToken, KingdomNFT, MasterContract } from "../typechain";

import {GetIncomeArray,GetBarracksCostArray,GetTownCenterCostArray} from "../scripts/utils";

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

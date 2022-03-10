import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DeployMasterContract } from "../scripts/utils";
describe("Minting Test", function () {
  it("Master can mint token to anyone", async function () {
    
    const [master,p1] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("FadingHopeToken");
    const token = await Factory.deploy();

    



    await token.deployed();
    token.grantRole(await token.MINTER_ROLE(),master.address);
    await token.mint(p1.address, 500000);
    expect(await token.balanceOf(p1.address)).to.eq(500000);
  });
});

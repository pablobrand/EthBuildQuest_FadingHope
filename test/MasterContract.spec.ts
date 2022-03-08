import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DeployMasterContract } from "./utils.spec";
describe("Master contract function", function () {

it ("Deployer setup array data");

  it("Player can claim rewards", async function () {
    const [owner, player] = await ethers.getSigners();
    const [master, token, kingdom] = await DeployMasterContract(owner.address);

    await master.freeMint(player.address, "good");
    // suppose the current block has a timestamp of 01:00 PM

    const time = (await ethers.provider.getBlock("latest")).timestamp + 86400
    await ethers.provider.send('evm_setNextBlockTimestamp', [time]);

    expect(await token.balanceOf(player.address)).to.eq(0);
  })
  it("Player can upgrade building")
  it("Player can upgrade TownCenter give right income")
});

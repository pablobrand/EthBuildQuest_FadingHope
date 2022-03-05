import { expect } from "chai";
import { ethers } from "hardhat";

describe("Gate Two Test", function () {
  it("Pass gates", async function () {
    const Gater = await ethers.getContractFactory("GatekeeperTwo");
    const Attacker = await ethers.getContractFactory("GateTwoAttacker");
    const gate = await Gater.deploy();
    await gate.deployed();
    const attacker = await Attacker.deploy(gate.address);
    await attacker.deployed();

    console.log("current holder:", await gate.entrant());
    expect(await gate.entrant()).to.equal((await ethers.getSigners())[0].address);

  }).timeout(600000);
});

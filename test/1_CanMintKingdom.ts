import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

describe("Alien test", function () {
  it("Local Test", async function () {
    const Factory = await ethers.getContractFactory("KingdomFactory");
    const factory = await Factory.deploy();
    await factory.deployed();
    // TODO: Add test here
  });
});

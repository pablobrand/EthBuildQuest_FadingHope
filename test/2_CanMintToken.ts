import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

describe("Minting Test", function () {
  it("Master can mint token to anyone", async function () {
    const Factory = await ethers.getContractFactory("FadingHopeToken");
    const factory = await Factory.deploy();
    await factory.deployed();
  });
});

import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

describe("Kingdom NFT", async function () {

  const [owner,player,] =  await ethers.getSigners();

  it("New kingdom owned by player", async function () {
    const Factory = await ethers.getContractFactory("KingdomFactory");
    const factory = await Factory.deploy(owner.address);
    await factory.deployed();

    const name = "Cool Name Ass";
    await factory.mintNFT(player.address, name);
  });
});

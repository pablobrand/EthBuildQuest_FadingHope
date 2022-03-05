import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

describe("Dex one test", function () {
  it("Swap 0 value coin get 0 price", async function () {
    const Token = await ethers.getContractFactory("SwappableToken");
    const DEX = await ethers.getContractFactory("Dex");
    const accs = await ethers.getSigners();
    const token1 = await Token.deploy("token1", "T1", BigNumber.from(100000000));
    const token2 = await Token.deploy("token2", "T2", BigNumber.from(100000000));

    await token1.deployed();
    await token2.deployed();
    let dex = await DEX.deploy(token1.address, token2.address);

    const [owner, player] = (await ethers.getSigners());
    const playerAddress = player.address;

    await token1.approve(dex.address, ethers.constants.MaxUint256);
    await token2.approve(dex.address, ethers.constants.MaxUint256);

    await token1.transfer(player.address, 100);
    await token2.transfer(player.address, 100);

    console.log("add liquidity");
    await dex.add_liquidity(token1.address, 1000);
    await dex.add_liquidity(token2.address, 1000);
    dex = dex.connect(player);
    await token1.connect(player).approve(dex.address, ethers.constants.MaxUint256);
    await token2.connect(player).approve(dex.address, ethers.constants.MaxUint256);
    await (await dex.approve(dex.address, ethers.constants.MaxUint256)).wait();
    console.log("swap test");

    await swap1();
    await swap2();
    await swap1();
    await swap2();
    await swap1();
    await swap2();


    async function swap1() {
      await (await dex.swap(token2.address, token1.address, await token2.balanceOf(playerAddress),)).wait();
      console.log("balance of token1: ", await token1.balanceOf(playerAddress));
      console.log("balance of token2: ", await token2.balanceOf(playerAddress));
      
      console.log("liquid1: ", await dex.balanceOf(token1.address, dex.address));
      console.log("liquid2: ", await dex.balanceOf(token2.address, dex.address));
    }

    async function swap2() {
      await (await dex.swap(token1.address, token2.address, await token1.balanceOf(playerAddress),)).wait()
      console.log("balance of token1: ", await token1.balanceOf(playerAddress));
      console.log("balance of token2: ", await token2.balanceOf(playerAddress));
      console.log("liquid1: ", await dex.balanceOf(token1.address, dex.address));
      console.log("liquid2: ", await dex.balanceOf(token2.address, dex.address));
    }
  });
});

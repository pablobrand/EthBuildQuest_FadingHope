import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DeployMasterContract } from "../scripts/utils";
import { GetIncomeArray, GetBarracksCostArray, GetTownCenterCostArray } from "../scripts/utils";

describe("Master contract function", function () {

  it("Deployer setup array data", async function () {
    const [owner, player] = await ethers.getSigners();
    const [master, token, kingdom] = await DeployMasterContract(owner.address);
    expect(await master.getBuildingCost(0, 10)).to.not.eq(BigNumber.from(0));
    expect(await master.getBuildingCost(1, 16)).to.not.eq(BigNumber.from(0));
  });

  it("Player can claim rewards", async function () {
    const [owner, player] = await ethers.getSigners();
    const [master, token, kingdom] = await DeployMasterContract(owner.address);

    await master.freeMint(player.address, "good");
    const nft = await kingdom.getTokenFromName("good");
    // suppose the current block has a timestamp of 01:00 PM
    expect(await token.balanceOf(player.address)).to.eq(0);
    const time = (await ethers.provider.getBlock("latest")).timestamp + 86400
    await ethers.provider.send('evm_mine', [time]);
    await master.ClaimKingdomReward(nft);
    expect(await token.balanceOf(player.address)).to.not.eq(0);
  })

  it("Player can upgrade building", async function () {
    const [owner, player] = await ethers.getSigners();
    let [master, token, kingdom] = await DeployMasterContract(owner.address);
    await master.freeMint(player.address, "good");
    const nft = await kingdom.getTokenFromName("good");

    expect(await token.balanceOf(player.address)).to.eq(0);
    let time = (await ethers.provider.getBlock("latest")).timestamp + 86400
    await ethers.provider.send('evm_mine', [time]);
    master = master.connect(player);
    await master.ClaimKingdomReward(nft);
    await master.UpgradeKingdomBuilding(nft, 0);
    expect(await kingdom.getBuildingLevel(nft, 0)).to.eq(2);
    await master.UpgradeKingdomBuilding(nft, 1);
    expect(await kingdom.getBuildingLevel(nft, 1)).to.eq(1);

    time = (await ethers.provider.getBlock("latest")).timestamp + 86400
    await ethers.provider.send('evm_mine', [time]);
    await master.ClaimKingdomReward(nft);

    await master.UpgradeKingdomBuilding(nft, 0);
    expect(await kingdom.getBuildingLevel(nft, 0)).to.eq(3);
  })

  it("Income reward is same as config", async function () {
    const [owner, player] = await ethers.getSigners();
    let [master, token, kingdom] = await DeployMasterContract(owner.address);

    await ethers.provider.send('evm_mine', [(await ethers.provider.getBlock("latest")).timestamp + 111]);

    await master.freeMint(player.address, "good");
    const nft = await kingdom.getTokenFromName("good");

    master = master.connect(player);

    expect(await token.balanceOf(player.address)).to.eq(0);

    const income = GetIncomeArray();



    await ethers.provider.send('evm_mine', [(await ethers.provider.getBlock("latest")).timestamp + 200]);

    const beforeClaimTime = (await kingdom.getLastClaimTime(nft));
    await master.ClaimKingdomReward(nft);
    expect((await kingdom.getLastClaimTime(nft))).to.gt(beforeClaimTime);


    expect(await token.balanceOf(player.address)).to.eq(income[1].mul((await ethers.provider.getBlock("latest")).timestamp - beforeClaimTime.toNumber() ));

    expect(await token.balanceOf(player.address)).to.gt(await master.getBuildingCost(0, 2));


    await master.UpgradeKingdomBuilding(nft, 0);
    expect(await kingdom.getBuildingLevel(nft, 0)).to.eq(2);

    await ethers.provider.send('evm_mine', [(await ethers.provider.getBlock("latest")).timestamp + 1234]);
    const timePassed = (await ethers.provider.getBlock("latest")).timestamp - (await kingdom.getLastClaimTime(nft)).toNumber();
    const balance = await token.balanceOf(player.address);
    await master.ClaimKingdomReward(nft);
    expect(await (await token.balanceOf(player.address)).toNumber()).to.approximately(balance.add(income[2].mul(timePassed)).toNumber() ,income[2].toNumber());

    await master.UpgradeKingdomBuilding(nft, 0);
    expect(await kingdom.getBuildingLevel(nft, 0)).to.eq(3);


    await ethers.provider.send('evm_mine', [(await ethers.provider.getBlock("latest")).timestamp + 996]);
    const timePassed2 = (await ethers.provider.getBlock("latest")).timestamp - (await kingdom.getLastClaimTime(nft)).toNumber();
    const balance2 = await token.balanceOf(player.address);
    await master.ClaimKingdomReward(nft);
    expect(await (await token.balanceOf(player.address)).toNumber()).to.approximately(balance2.add(income[3].mul(timePassed2)).toNumber() ,income[3].toNumber());

  })

  it("Player can freemint", async function (){
    const [owner, player] = await ethers.getSigners();
    const [master, token, kingdom] = await DeployMasterContract(owner.address);

    await master.freeMint(player.address, "good");
    const nft = await kingdom.getTokenFromName("good");
    expect(await kingdom.getRuler(nft)).to.eq(player.address);

    await master.freeMintWithURI(player.address, "good2","someCoolString");
    const nft2 = await kingdom.getTokenFromName("good2");
    expect(await kingdom.getRuler(nft2)).to.eq(player.address);
    expect(await kingdom.getURIFromName("good2")).to.eq("someCoolString");
    expect(await kingdom.tokenURI(nft2)).to.eq("someCoolString");
  })
});

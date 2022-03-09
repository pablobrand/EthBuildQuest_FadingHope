import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

describe("Kingdom NFT", function () {

  it("Master should be default admin of NFT", async function () {
    const [, , , testOwner,] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("KingdomNFT");
    const factory = await Factory.deploy(testOwner.address);
    await factory.deployed();
    expect(await factory.hasRole(await factory.DEFAULT_ADMIN_ROLE(), testOwner.address)).to.be.true;
  })

  it("player can own 3 kingdoms", async function () {

    const [owner, player,] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("KingdomNFT");
    const kingdom = await Factory.deploy(owner.address);
    await kingdom.deployed();

    const name = "Cool Name Ass";
    await kingdom.mint(player.address, name);

    await kingdom.mint(player.address, "Kingdom 2");
    await kingdom.mint(player.address, "Kingdom 3");

    const totalKingdomOwned = await kingdom.balanceOf(player.address);
    // we can get player tokenId by using owner address
    
    expect(totalKingdomOwned).to.eq(3, "player can mint total 3 kingdoms");
    const kingdom1 = await kingdom.tokenOfOwnerByIndex(player.address, 0);
    const kingdom2 = await kingdom.tokenOfOwnerByIndex(player.address, 1);
    const kingdom3 = await kingdom.tokenOfOwnerByIndex(player.address, 2);

    expect(kingdom1).to.not.eq(0, "player should not own token index 0");
    expect(await kingdom.ownerOf(kingdom1)).to.eq(player.address, "player should own Kingdom 1");
    expect(await kingdom.ownerOf(kingdom2)).to.eq(player.address, "player should own Kingdom 2");
    expect(await kingdom.ownerOf(kingdom3)).to.eq(player.address, "player should own Kingdom 3");

    // kingdom name should be correct
    expect(await kingdom.getName(kingdom1)).to.eq(name, "kingdom name should be correct");
    expect(await kingdom.getName(kingdom2)).to.eq("Kingdom 2", "kingdom name should be correct");
    expect(await kingdom.getName(kingdom3)).to.eq("Kingdom 3", "kingdom name should be correct");

    expect(await kingdom.getLastClaimTime(kingdom1)).to.not.eq(0, "last claim time is 0");
  });

  it("kingdom can search token", async function () {
    const [owner, player,] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("KingdomNFT");
    const kingdom = await Factory.deploy(owner.address);
    await kingdom.deployed();

    const name = "Cool Name Ass";
    await kingdom.mint(player.address, name);
    const token = await kingdom.getTokenFromName("Cool Name Ass");
    expect(token).to.not.eq(0, "token should not be 0");
    expect(await kingdom.ownerOf(token)).to.eq(player.address, "player should own token");

  })

  it("kingdom towncenter should be lv 1", async function () {
    const [owner, player,] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("KingdomNFT");
    const kingdom = await Factory.deploy(owner.address);
    await kingdom.deployed();

    const name = "Cool Name Ass";
    await kingdom.mint(player.address, name);

    const token = await kingdom.tokenOfOwnerByIndex(player.address, 0);

    // TownCenter lv 1


    expect(await kingdom.getBuildingLevel(token, 0)).to.eq(1, "towncenter should be lv 1");
    // Barrack lv 0
    expect(await kingdom.getBuildingLevel(token, 1)).to.eq(0, "barrack should be lv 0");
    // Wall lv 0
    expect(await kingdom.getBuildingLevel(token, 2)).to.eq(0, "wall should be lv 0");
    // Non Exist building lv 0
    expect(kingdom.getBuildingLevel(token, 6666)).to.be.reverted;
  })
  
  it("Master can change building level", async function () {
    const [owner, player] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("KingdomNFT");
    const kingdom = await Factory.deploy(owner.address);
    await kingdom.deployed();

    const name = "Cool Name Ass";
    await kingdom.mint(player.address, name);

    const token = await kingdom.tokenOfOwnerByIndex(player.address, 0);

    await kingdom.setBuildingLevel(token, 0, 10);
    expect(await kingdom.getBuildingLevel(token, 0)).to.eq(10, "towncenter should be lv 10");

    await kingdom.setBuildingLevel(token, 1, BigNumber.from("5220000000000000006"));
    expect(await kingdom.getBuildingLevel(token, 1)).to.eq(BigNumber.from("5220000000000000006"), "barrack should be lv 5220000000000000006");
    
    await kingdom.setBuildingLevel(token, 2, BigNumber.from("56622"));
    await kingdom.setBuildingLevel(token, 2, BigNumber.from("0"));
    expect(await kingdom.getBuildingLevel(token, 2)).to.eq(BigNumber.from("0"), "wall should be lv 0");
  })

  it("should revert empty name", async function () {
    const [owner, player,] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("KingdomNFT");
    const kingdom = await Factory.deploy(owner.address);
    await kingdom.deployed();

    const name = "";
    expect(kingdom.mint(player.address, name)).to.revertedWith("Kingdom name cannot be empty");
  })

  it("should revert duplicate name", async function () {
    const [owner, player,] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("KingdomNFT");
    const kingdom = await Factory.deploy(owner.address);
    await kingdom.deployed();

    const name = "duplicate";
    await kingdom.mint(player.address, name)
    expect(kingdom.mint(player.address, name)).to.revertedWith("Name already exist");
  })

  it("master can set occupation", async function () {
    const [owner, player,] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("KingdomNFT");
    const kingdom = await Factory.deploy(owner.address);
    await kingdom.deployed();

    const name = "Cool Name Ass";
    await kingdom.mint(player.address, name);

    const token = await kingdom.tokenOfOwnerByIndex(player.address, 0);

    expect(await kingdom.getOccupation(token)).to.be.false;
    await kingdom.setOccupation(token, true);
    expect(await kingdom.getOccupation(token)).to.be.true;
    await kingdom.setOccupation(token, false);
    expect(await kingdom.getOccupation(token)).to.be.false;
  })
  
  it("master can destroy kingdom", async function () {
    const [owner, player,attacker] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("KingdomNFT");
    const kingdom = await Factory.deploy(owner.address);
    await kingdom.deployed();
    await kingdom.mint(player.address, "my king");

    const token = await kingdom.getTokenFromName("my king");
    expect(await kingdom.balanceOf(player.address)).to.eq(1, "player should have 1 kingdom");
    await kingdom.destroyKingdom(token);
    expect(await kingdom.balanceOf(player.address)).to.eq(0, "player should have 0 kingdom");
    
    expect(kingdom.mint(player.address, "my king")).to.revertedWith("Name already exist");
    
    expect(kingdom.mint(player.address, "my king 2")).to.reverted;
    expect(await kingdom.balanceOf(player.address)).to.eq(1, "player should have 1 kingdom after destroy one and mint 2");
    const token2 = await kingdom.getTokenFromName("my king 2");
    expect(kingdom.connect(attacker).destroyKingdom(token2)).to.be.reverted;
    
  });

  it("owner can update IPFS URI", async function () {
    const [owner, player,] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("KingdomNFT");
    let kingdom = await Factory.deploy(owner.address);
    await kingdom.deployed();
    await kingdom.mint(player.address, "Kingdom 1");
    kingdom = kingdom.connect(player);

    const token = await kingdom.tokenOfOwnerByIndex(player.address, 0);
    await kingdom.setTokenURI(token, "QmWATWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P5S5");
    
    expect(await kingdom.tokenURI(token)).to.eq("QmWATWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P5S5", "IPFS URI should be correct");
    expect(await kingdom.getURIFromName("Kingdom 1")).to.eq(await kingdom.tokenURI(token));

    await kingdom.setTokenURI(token, "5as1d65a1s6d16as1 65asd6 as56 asd");
    
    expect(await kingdom.tokenURI(token)).to.eq("5as1d65a1s6d16as1 65asd6 as56 asd", "IPFS URI should be correct");
    
  })

});

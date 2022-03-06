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
    expect(totalKingdomOwned).to.eq(3, "player should have total 3 kingdoms");
    const kingdom1 = await kingdom.tokenOfOwnerByIndex(player.address, 0);
    const kingdom2 = await kingdom.tokenOfOwnerByIndex(player.address, 1);
    const kingdom3 = await kingdom.tokenOfOwnerByIndex(player.address, 2);

    expect(kingdom1).to.not.eq(0, "player should not own token index 0");
    expect(await kingdom.ownerOf(kingdom1)).to.eq(player.address, "player should own Kingdom 1");
    expect(await kingdom.ownerOf(kingdom2)).to.eq(player.address, "player should own Kingdom 2");
    expect(await kingdom.ownerOf(kingdom3)).to.eq(player.address, "player should own Kingdom 3");
    // Get ruler return same as ownerOf
    expect(await kingdom.getRuler(kingdom1)).to.eq(player.address, "player should own Kingdom 1");
    expect(await kingdom.getRuler(kingdom2)).to.eq(player.address, "player should own Kingdom 2");
    expect(await kingdom.getRuler(kingdom3)).to.eq(player.address, "player should own Kingdom 3");
    // kingdom name should be correct
    expect(await kingdom.getName(kingdom1)).to.eq(name, "kingdom name should be correct");
    expect(await kingdom.getName(kingdom2)).to.eq("Kingdom 2", "kingdom name should be correct");
    expect(await kingdom.getName(kingdom3)).to.eq("Kingdom 3", "kingdom name should be correct");
  });

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
    expect(await kingdom.getBuildingLevel(token, 6666)).to.eq(0, "non exist building should be lv 0");

    // Get level list of building
    const levelList = await kingdom.getBuildingsLevel(token, [0, 2, 3, 5]);
    expect(levelList[0]).to.eq(1, "towncenter should be lv 1");
    expect(levelList[1]).to.eq(0, "barrack should be lv 0");
    expect(levelList[2]).to.eq(0, "wall should be lv 0");
    expect(levelList[3]).to.eq(0, "non exist building should be lv 0");

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
  it("master can burn kingdom")
  it("master can upgrade kingdom")
  it("master can set IPFS URI", async function () {
    const [owner, player,] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("KingdomNFT");
    const kingdom = await Factory.deploy(owner.address);
    await kingdom.deployed();
    await kingdom.mint(player.address, "Kingdom 1");

    const token = await kingdom.tokenOfOwnerByIndex(player.address, 0);
    const towncenter = (ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TownCenter")));
    const barrack = (ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Barrack")));
    const icon = (ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Icon")));
    await kingdom.setTokenURI(token, towncenter, "QmWATWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P5S5");
    await kingdom.setTokenURI(token, barrack, "QmWATWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P111");
    await kingdom.setTokenURI(token, icon, "QmWATWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P333");
    expect(await kingdom.getTokenURI(token, towncenter)).to.eq("QmWATWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P5S5", "IPFS URI towncenter should be correct");
    expect(await kingdom.getTokenURI(token, barrack)).to.eq("QmWATWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P111", "IPFS URI barrack should be correct");
    expect(await kingdom.getTokenURI(token, icon)).to.eq("QmWATWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P333", "IPFS URI icon should be correct");
    
    // Set multiple keys
    await kingdom.setTokenURIs(token, [towncenter, barrack, icon], ["TCWATWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P5S5", "BRWATWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P111", "ICONTWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P333"]);
    
    
    // read multiple keys from URI
    const [towncenterURI, barrackURI, iconURI] = await kingdom.getTokenURIs(token, [towncenter, barrack, icon]);
    expect(towncenterURI).to.eq("TCWATWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P5S5", "Array IPFS towncenter should be correct");
    expect(barrackURI).to.eq("BRWATWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P111", "Array IPFS barrack should be correct");
    expect(iconURI).to.eq("ICONTWQ7fVPP2EFGu71UkfnQ7BhAgB6gP1myVENZ6P333", "Array IPFS icon should be correct");

  })

});

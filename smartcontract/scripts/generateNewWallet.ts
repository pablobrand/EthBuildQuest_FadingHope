import { ethers, Signer } from "ethers";


async function main() {
  const wallet = ethers.Wallet.createRandom();
  console.log("address:", wallet.address);
  console.log("private key:", wallet.privateKey);
  console.log("mnemonic key:", wallet.mnemonic);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

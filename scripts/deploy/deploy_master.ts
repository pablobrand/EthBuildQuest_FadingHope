import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;
  console.log("deployer address:",deployer);
  const master = await deploy("MasterContract", {
    from: deployer,
    args: [],
    log: true
  });

  const kingdom = await deploy("KingdomNFT", {
    from: deployer,
    args: [master.address],
    log: true
  });

  const masterCT = (await ethers.getContractFactory("MasterContract")).attach(master.address);
  console.log("set kingdom address to:", kingdom.address);
  await masterCT.setKingdomNFT(kingdom.address, {gasLimit: 1000000});

};

deploy.tags = ['hackathon']
export default deploy;

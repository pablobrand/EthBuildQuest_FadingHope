import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { AttachAndSetupMasterContract } from "../utils";
const deploy: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;
  console.log("deployer address:", deployer);

  const token = await deploy("FadingHopeToken", {
    from: deployer,
    args: [],
    log: true
  });

  const kingdom = await deploy("KingdomNFT", {
    from: deployer,
    args: [deployer],
    log: true
  });

  // Ropsten IMX address: 0x6C21EC8DE44AE44D0992ec3e2d9f1aBb6207D864
  const master = await deploy("MasterContract", {
    from: deployer,
    args: [token.address, kingdom.address],
    log: true
  });
  await AttachAndSetupMasterContract(token.address, kingdom.address, master.address);
};

deploy.tags = ['hackathon']
export default deploy;

import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

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

  const master = await deploy("MasterContract", {
    from: deployer,
    args: [token.address,kingdom.address],
    log: true
  });

  const tokenCT = (await ethers.getContractFactory("FadingHopeToken")).attach(token.address);
  console.log("set master contract to minter role");
  await (await tokenCT.grantRole(await tokenCT.MINTER_ROLE(), master.address, { gasLimit: 1000000 })).wait();
  console.log("check master has minter role:", await tokenCT.hasRole(await tokenCT.MINTER_ROLE(), master.address));

  const kingdomCT = (await ethers.getContractFactory("KingdomNFT")).attach(kingdom.address);
  console.log("set master contract to admin role");
  await (await kingdomCT.grantRole(await kingdomCT.ADMIN_ROLE(), master.address, { gasLimit: 1000000 })).wait();
  console.log("check master has admin role:", await kingdomCT.hasRole(await kingdomCT.ADMIN_ROLE(), master.address));
};

deploy.tags = ['hackathon']
export default deploy;

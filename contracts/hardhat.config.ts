import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-ethers";
import "hardhat-watcher";
import "hardhat-deploy";
import "solidity-coverage";

import "./scripts/tasks/deploy";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  paths: {
    artifacts: "build/artifacts",
    cache: "build/cache",
    deploy: "scripts/deploy",
    sources: "contracts",
  },
  namedAccounts: {
    deployer: "0x9c9242F46692c0D3d262Cc3247c33359755Fd228", // Should be address from privatekey
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4"
      }
    ],
    // version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ropsten: {
      url: process.env.ROPSTEN_INFURA_KEY || "",
      accounts:
        process.env.ROPSTEN_DEPLOYER_PRIV_KEY !== undefined ? [process.env.ROPSTEN_DEPLOYER_PRIV_KEY] : [],
      chainId: 3,
    },
    okovan: {
      url: process.env.KOVAN_INFURA_KEY || "",
      accounts:
        process.env.KOVAN_DEPLOYER_PRIV_KEY !== undefined ? [process.env.KOVAN_DEPLOYER_PRIV_KEY] : [],
      chainId: 69,
    },
    optimisticKovan: {
      url: process.env.KOVAN_INFURA_KEY || "",
      accounts:
        process.env.KOVAN_DEPLOYER_PRIV_KEY !== undefined ? [process.env.KOVAN_DEPLOYER_PRIV_KEY] : [],
      chainId: 69,
    },
    mumbai: {
      url: process.env.MUMBAI_INFURA_KEY || "",
      accounts:
        process.env.MUMBAI_DEPLOYER_PRIV_KEY !== undefined ? [process.env.MUMBAI_DEPLOYER_PRIV_KEY] : [],
      chainId: 80001,
    },
    hardhat: {
      initialBaseFeePerGas: 0,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    // ETH: 64D8FMTIH1UG2BCD2A1BFMFZCTF6S2YG95
    // optimisn: Q3SXHT8B3IRAYPRRNMPEBEKCWHHC74IG3Q
    // polygon : 5G241ETRX733HZF3BV9X3SUSVHAVF6NTFS
    apiKey: "64D8FMTIH1UG2BCD2A1BFMFZCTF6S2YG95",
  },
  watcher: {
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true
      // params: { noCompile: true, testFiles: ["testfile.ts"] }
    },
    "test-local": {
      tasks: [{ command: 'test', params: { noCompile: false, testFiles: ['{path}'], network: "localhost" } }],
      files: ['./test/**/*'],
      verbose: true
      // params: { noCompile: true, testFiles: ["testfile.ts"] }
    },
    compile: {
      tasks: ["compile"],
      // files: ["./contracts/**/*"],
      verbose: true,
    },
  }
};

export default config;

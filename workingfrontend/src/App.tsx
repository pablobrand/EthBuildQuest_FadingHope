/* eslint-disable node/no-missing-import */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import logo from "./logo.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Card, Typography } from "antd";
import { useMoralis, useWeb3Contract } from "react-moralis";
import abi from "../src/contracts/MasterContract.json";
import { BigNumber, ethers } from "ethers";
import { Dropdown } from "react-bootstrap";
import detectEthereumProvider from "@metamask/detect-provider";
import {
  Blog,
  Features,
  Footer,
  Header,
  Possibility,
  WhatGPT3,
} from "./containers";
import { Brand, CTA, Navbar } from "./components";
import "./App.css";
import { GetContracts, GetGameConfig } from "./utils/contracts";
import { FadingHopeToken, KingdomNFT, MasterContract } from "./utils/typechain";
import { useForm } from "react-hook-form";

type Profile = {
  kindomname: string;
  pinataurl: string;
};

class PlayerKingdom {
  owner!: string;
  balance!: BigNumber;
  tokenId!: BigNumber;
  name!: string;
  uri!: string;
  metadata!: string;
  townCenterLv!: BigNumber;
  lastRewardTime!: BigNumber;
}

function App() {
  let signer: ethers.providers.JsonRpcSigner;
  let master: MasterContract;
  let token: FadingHopeToken;
  let kingdom: KingdomNFT;
  const currentKingdom: PlayerKingdom = new PlayerKingdom();
  const gameConfig = GetGameConfig();

  // Set default value
  window.onload = () => onLoadWeb();
  const onLoadWeb = async () => {
    console.log("website loaded");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = (await detectEthereumProvider()) as any;
    console.log(provider.networkVersion, "window.ethereum.networkVersion");
    await SwitchNetwork(provider.networkVersion);
    console.log("attaching contract ");
    await refresh();

    provider.on("accountsChanged", (accounts) => refresh());
    provider.on("chainChanged", (chain) => refresh());
  };

  // Update text pending reward every 0.1s
  setInterval(() => {
    updatePendingRewards();
  }, 1000);

  async function SwitchNetwork(network: string) {
    console.log("switching network to " + network);
    let networkName = "rinkeby";
    switch (network.toLowerCase()) {
      case "polygon":
      case "mumbai":
      case "80001":
      case "matic":
        networkName = "mumbai"
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x13881",
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC", // 2-6 characters long
                decimals: 18,
              },
              chainName: "Matic Mumbai Testnet",
              rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
              blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
            },
          ], // chainId must be in hexadecimal numbers
        });
        break;
      case "69":
      case "optimistic kovan":
        networkName = "okovan"
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: BigNumber.from(69).toHexString(),
              nativeCurrency: {
                name: "OETH",
                symbol: "OETH", // 2-6 characters long
                decimals: 18,
              },
              chainName: "Optimistic Kovan testnet",
              rpcUrls: ["https://kovan.optimism.io"],
              blockExplorerUrls: ["https://kovan-optimistic.etherscan.io"],
            },
          ], // chainId must be in hexadecimal numbers
        });
        break;
      case "4":
      case "rinkeby":
        networkName = "rinkeby"
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x4" }], // chainId must be in hexadecimal numbers
        });
        break;
      case "3":
      case "ropsten":
        networkName = "ropsten"
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x3" }], // chainId must be in hexadecimal numbers
        });
        break;
      default:
        networkName = "rinkeby"
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x4" }], // chainId must be in hexadecimal numbers
        });
        break;
    }
    [signer, master, token, kingdom] = await GetContracts(networkName);
  }

  function updatePendingRewards() {
    if (
      currentKingdom === undefined ||
      currentKingdom.lastRewardTime == null ||
      currentKingdom.townCenterLv.lt(1)
    )
      return;
    const timeNow = Date.now().toString().substr(0, 10);
    const timePassed = currentKingdom.lastRewardTime.sub(timeNow).mul(-1);
    const income = gameConfig.GetBuildingConfig(
      currentKingdom.townCenterLv.toNumber()
    ).IncomePerSec;
    setText(
      "towncenter_rewards",
      "pending rewards: " + income.mul(timePassed).toString() + " FDH"
    );
  }

  const { runContractFunction, isLoading } = useWeb3Contract({
    functionName: "freeMintWithURI",
    abi,
    contractAddress: "0x4AEAd9bEcF5F7794dF6618885c283F68b4a0C848",
    params: {
      account: String,
      kingdomName: String,
      uri: String,
    },
  });
  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
  } = useMoralis();

  const login = async () => {
    if (!isAuthenticated) {
      await authenticate({ signingMessage: "Log in using Moralis" })
        .then(function (user) {
          console.log("logged in user:", user);
          console.log(user!.get("ethAddress"));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  const logOut = async () => {
    await logout();
    console.log("logged out");
  };

  const refresh = async () => {
    const playerAddress = await signer.getAddress();
    currentKingdom.owner = playerAddress;
    const tokenOwnedCount = await kingdom.balanceOf(playerAddress);

    setText("owner", "owner: " + currentKingdom.owner);

    if (tokenOwnedCount.gt(0)) {
      currentKingdom.tokenId = await kingdom.tokenOfOwnerByIndex(
        playerAddress,
        0
      );
      currentKingdom.name = await kingdom.getName(currentKingdom.tokenId);
      setText("tokenId", "tokenId: " + currentKingdom.tokenId.toString());
      setText("kingdom_name_desc", "kingdom: " + currentKingdom.name);
      currentKingdom.townCenterLv = await kingdom.getBuildingLevel(
        currentKingdom.tokenId,
        0
      );
      setText(
        "towncenter",
        "townLevel: " + currentKingdom.townCenterLv.toNumber()
      );
      currentKingdom.lastRewardTime = await kingdom.getLastClaimTime(
        currentKingdom.tokenId
      );
      // setText("tc_lastClaimTime", "lastClaimTime: " + currentKingdom.lastRewardTime.toNumber());

      const income = gameConfig.GetBuildingConfig(
        currentKingdom.townCenterLv.toNumber()
      ).IncomePerSec;
      setText("towncenter_income", "income: " + income.toString() + "/s");

      setText(
        "towncenter_upgradecost",
        "upgrade cost: " +
          gameConfig
            .GetBuildingConfig(currentKingdom.townCenterLv.toNumber())
            .TownCost.toString() +
          " FDH"
      );
    } else {
      console.log("no token kingdom NFT owned");
      setText("kingdom_name_desc", "You control no kingdom. Mint some.");
      setText("tokenId", "You control no kingdom. Mint some.");
    }

    currentKingdom.balance = await token.balanceOf(playerAddress);
    setText(
      "balance",
      "balance: " + currentKingdom.balance.toString() + " FDH"
    );

    console.log(currentKingdom);
  };

  const claimReward = async () => {
    const tx = await master.ClaimKingdomReward(currentKingdom.tokenId);
    console.log("send tx");
    const result = await tx.wait();
    console.log("tx mined");
    console.log(result);
    await refresh();
  };

  const upgradeTownCenter = async () => {
    const tx = await master.UpgradeKingdomBuilding(currentKingdom.tokenId, 0);
    console.log("send tx");
    const result = await tx.wait();
    console.log("tx mined");
    console.log(result);
    await refresh();
  };

  function setText(id: string, value: string) {
    const doc = document.getElementById(id);
    if (doc != null) doc.textContent = value;
  }

  const { register, handleSubmit } = useForm<Profile>();

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    const tx = await master.freeMintWithURI(
      await signer.getAddress(),
      data.kindomname,
      data.pinataurl
    );

    console.log("send tx");
    const result = await tx.wait();
    console.log("tx mined");
    console.log(result);
    await refresh();
  });

  const htmlWeb = (
    <div className="App">
      <div className="gradient__bg">
        <div className="gpt3__navbar">
          <div className="gpt3__navbar-links">
            <div className="gpt3__navbar-links_logo">
              <Navbar />
            </div>
          </div>
          <div>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                Switch Network
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => SwitchNetwork("Ropsten")}>
                  Ropsten Testnet
                </Dropdown.Item>
                <Dropdown.Item onClick={() => SwitchNetwork("Rinkeby")}>
                  Rinkeby Testnet
                </Dropdown.Item>
                <Dropdown.Item onClick={() => SwitchNetwork("mumbai")}>
                  Matic/Polygon Testnet
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => SwitchNetwork("optimistic kovan")}
                >
                  Optimism Kovan Testnet
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button onClick={login}>Play & Earn</Button>
            <Button onClick={logOut} disabled={isAuthenticating}>
              Logout
            </Button>
          </div>
        </div>
        {/* <Header /> */}

        {/* <Brand />
  <WhatGPT3 />
  <Features />
  <Possibility />
  <CTA />
  <Blog /> */}
        <div style={{ display: "flex" }}>
          <Card
            bordered={false}
            style={{
              width: 600,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography.Title level={3}>NFT Minter</Typography.Title>
            <img
              src="https://ipfs.moralis.io:2053/ipfs/QmebxzVBtcEznrZgSUxorrdL8Q1XEbiyRaGxHUuwWUoF1o/images/0.png"
              alt="Test"
              style={{ marginBottom: "2rem" }}
            />
            {/* <Button
              type="primary"
              shape="round"
              size="large"
              style={{ width: "100%" }}
              loading={isLoading}
              onClick={() => runContractFunction()}
            >
              MINT
            </Button> */}

            {/* <input
              id="kingdomName"
              type="text"
              className="form-control"
              placeholder="Kingdom Name"
              aria-label="kingdomName"
              aria-describedby="basic-addon1"
            />
            <input
              id="URI"
              type="text"
              className="form-control"
              placeholder="URI"
              aria-label="URI"
              aria-describedby="basic-addon1"
            />
            <Button
              type="primary"
              shape="round"
              size="large"
              style={{ width: "100%" }}
              loading={isLoading}
              onClick={() => mintDirectly()}
            >
              MINT directly
            </Button> */}
            <form onSubmit={onSubmit}>
              <div>
                <label htmlFor="kindomname">Kindom Name</label>
                <input
                  id="kindomname"
                  type="text"
                  {...register("kindomname", {})}
                />
              </div>
              <div>
                <label htmlFor="pinataurl">NFT URL</label>
                <input
                  id="pinataurl"
                  type="text"
                  {...register("pinataurl", {})}
                />
              </div>
              <button type="submit">Mint NFT</button>
            </form>
          </Card>
          <Footer />
        </div>
        <div>
          <Button onClick={refresh}>refresh profile</Button>
          <p id="player">Player Profile:</p>
          <p id="owner">owner:</p>
          <p id="tokenId">tokenId:</p>
          <p id="balance">balance:</p>
          <p id="kingdom_name_desc">Kingdom:</p>
          <p id="towncenter">Town Center lv -1</p>
          <p id="towncenter_income">Income: </p>
          <p id="towncenter_rewards">Pending rewards</p>
          <Button onClick={claimReward}>Claim</Button>
          <p id="towncenter_upgradecost">Towncenter upgrade cost:</p>
          <Button onClick={upgradeTownCenter}>Upgrade town center</Button>
        </div>
      </div>
    </div>
  );
  return htmlWeb;
}

export default App;

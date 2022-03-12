import React, { Component } from "react";
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
        networkName = "mumbai";
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
        networkName = "okovan";
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
        networkName = "rinkeby";
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x4" }], // chainId must be in hexadecimal numbers
        });
        break;
      case "3":
      case "ropsten":
        networkName = "ropsten";
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x3" }], // chainId must be in hexadecimal numbers
        });
        break;
      default:
        networkName = "rinkeby";
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
    if (doc != null) (doc as any).text= value;
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

        {<Header />}
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
              src="https://gateway.pinata.cloud/ipfs/QmQ9gyxmVqQ2LbMWAQDCRTr29W9Gv9h12mZwmJdRVB1EXC"
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
  const homeWeb = (
        <div>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta charSet="utf-8" />
          <meta name="keywords" />
          <meta name="description" />
          <meta name="page_type" content="np-template-header-footer-from-plugin" />
          <title>Home</title>
          <link rel="stylesheet" href="app.css" media="screen" />
          <link rel="stylesheet" href="Home.css" media="screen" />
          <meta name="generator" content="Nicepage 4.6.5, nicepage.com" />
          <link id="u-theme-google-font" rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i|Open+Sans:300,300i,400,400i,500,500i,600,600i,700,700i,800,800i" />
          <meta name="theme-color" content="#478ac9" />
          <meta name="twitter:site" content="@" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Home" />
          <meta name="twitter:description" />
          <meta property="og:title" content="Home" />
          <meta property="og:type" content="website" />
          <header className="u-black u-clearfix u-header u-header" id="sec-6e9a"><div className="u-clearfix u-sheet u-sheet-1">
              <h3 className="u-headline u-text u-text-default u-text-1">
                <a>FADING HOPE<br />
                </a>
              </h3>
              <form action="#" method="get" className="u-border-1 u-border-grey-30 u-radius-50 u-search u-search-left u-white u-search-1">
                <button className="u-search-button" type="submit">
                  <span className="u-search-icon u-spacing-10">
                    <svg className="u-svg-link" preserveAspectRatio="xMidYMin slice" viewBox="0 0 56.966 56.966"><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#svg-e81e" /></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="svg-e81e" x="0px" y="0px" viewBox="0 0 56.966 56.966" xmlSpace="preserve" className="u-svg-content"><path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" /></svg>
                  </span>
                </button>
                <input className="u-search-input" type="search" name="search" defaultValue="" placeholder="Search" />
              </form>
              <img className="u-image u-image-round u-radius-29 u-image-1" src="images/cover-photo.png" alt="" data-image-width={600} data-image-height={201} />
              <img className="u-border-5 u-border-white u-image u-image-circle u-preserve-proportions u-image-2" src="images/Bitmap.png" alt="" data-image-width={134} data-image-height={134} />
              <div className="u-align-left u-border-2 u-border-palette-1-base u-container-style u-group u-radius-50 u-shape-round u-group-1">
                <div className="u-container-layout u-container-layout-1">
                  <h3 className="u-headline u-text u-text-default u-text-2">
                    <a>WORLD EVENTS</a>
                  </h3>
                  <a className="u-border-none u-btn u-btn-round u-button-style u-hover-palette-1-light-1 u-palette-2-base u-radius-50 u-btn-1"> @Amatur destroy @Alama Kingdom</a>
                  <a className="u-btn u-btn-round u-button-style u-hover-palette-1-light-1 u-palette-1-base u-radius-50 u-btn-2">&nbsp; &nbsp; &nbsp; &nbsp;​@Penguin Upgrade Town to lv 30&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</a>
                  <a className="u-border-none u-btn u-btn-round u-button-style u-custom-color-2 u-hover-palette-4-light-2 u-radius-50 u-btn-3"> @WinterKingdom just harvest 300,000 FDH</a>
                </div>
              </div>
              <div className="u-social-icons u-spacing-10 u-social-icons-1">
                <a className="u-social-url" title="facebook" target="_blank"><span className="u-icon u-social-facebook u-social-icon u-icon-1"><svg className="u-svg-link" preserveAspectRatio="xMidYMin slice" viewBox="0 0 112 112" style={{}}><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#svg-9e05" /></svg><svg className="u-svg-content" viewBox="0 0 112 112" x={0} y={0} id="svg-9e05"><circle fill="currentColor" cx="56.1" cy="56.1" r={55} /><path fill="#FFFFFF" d="M73.5,31.6h-9.1c-1.4,0-3.6,0.8-3.6,3.9v8.5h12.6L72,58.3H60.8v40.8H43.9V58.3h-8V43.9h8v-9.2
  c0-6.7,3.1-17,17-17h12.5v13.9H73.5z" /></svg></span>
                </a>
                <a className="u-social-url" title="twitter" target="_blank"><span className="u-icon u-social-icon u-social-twitter u-icon-2"><svg className="u-svg-link" preserveAspectRatio="xMidYMin slice" viewBox="0 0 112 112" style={{}}><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#svg-0a1b" /></svg><svg className="u-svg-content" viewBox="0 0 112 112" x={0} y={0} id="svg-0a1b"><circle fill="currentColor" className="st0" cx="56.1" cy="56.1" r={55} /><path fill="#FFFFFF" d="M83.8,47.3c0,0.6,0,1.2,0,1.7c0,17.7-13.5,38.2-38.2,38.2C38,87.2,31,85,25,81.2c1,0.1,2.1,0.2,3.2,0.2
  c6.3,0,12.1-2.1,16.7-5.7c-5.9-0.1-10.8-4-12.5-9.3c0.8,0.2,1.7,0.2,2.5,0.2c1.2,0,2.4-0.2,3.5-0.5c-6.1-1.2-10.8-6.7-10.8-13.1
  c0-0.1,0-0.1,0-0.2c1.8,1,3.9,1.6,6.1,1.7c-3.6-2.4-6-6.5-6-11.2c0-2.5,0.7-4.8,1.8-6.7c6.6,8.1,16.5,13.5,27.6,14
  c-0.2-1-0.3-2-0.3-3.1c0-7.4,6-13.4,13.4-13.4c3.9,0,7.3,1.6,9.8,4.2c3.1-0.6,5.9-1.7,8.5-3.3c-1,3.1-3.1,5.8-5.9,7.4
  c2.7-0.3,5.3-1,7.7-2.1C88.7,43,86.4,45.4,83.8,47.3z" /></svg></span>
                </a>
                <a className="u-social-url" title="instagram" target="_blank"><span className="u-icon u-social-icon u-social-instagram u-icon-3"><svg className="u-svg-link" preserveAspectRatio="xMidYMin slice" viewBox="0 0 112 112" style={{}}><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#svg-f5c2" /></svg><svg className="u-svg-content" viewBox="0 0 112 112" x={0} y={0} id="svg-f5c2"><circle fill="currentColor" cx="56.1" cy="56.1" r={55} /><path fill="#FFFFFF" d="M55.9,38.2c-9.9,0-17.9,8-17.9,17.9C38,66,46,74,55.9,74c9.9,0,17.9-8,17.9-17.9C73.8,46.2,65.8,38.2,55.9,38.2
  z M55.9,66.4c-5.7,0-10.3-4.6-10.3-10.3c-0.1-5.7,4.6-10.3,10.3-10.3c5.7,0,10.3,4.6,10.3,10.3C66.2,61.8,61.6,66.4,55.9,66.4z" /><path fill="#FFFFFF" d="M74.3,33.5c-2.3,0-4.2,1.9-4.2,4.2s1.9,4.2,4.2,4.2s4.2-1.9,4.2-4.2S76.6,33.5,74.3,33.5z" /><path fill="#FFFFFF" d="M73.1,21.3H38.6c-9.7,0-17.5,7.9-17.5,17.5v34.5c0,9.7,7.9,17.6,17.5,17.6h34.5c9.7,0,17.5-7.9,17.5-17.5V38.8
  C90.6,29.1,82.7,21.3,73.1,21.3z M83,73.3c0,5.5-4.5,9.9-9.9,9.9H38.6c-5.5,0-9.9-4.5-9.9-9.9V38.8c0-5.5,4.5-9.9,9.9-9.9h34.5
  c5.5,0,9.9,4.5,9.9,9.9V73.3z" /></svg></span>
                </a>
              </div>
              <p className="u-text u-text-default u-text-white u-text-3">RULER : HAPPY STARLORD</p>
              <p className="u-text u-text-body-alt-color u-text-default u-text-4">ADDRESS : <span style={{fontSize: "0.875rem"}}>0x9c9242F46692c0D3d262Cc3247c33359755Fd228</span>
              </p>
              <p className="u-text u-text-body-alt-color u-text-default u-text-5">BIO : PENGUIN KINGDOM IN SPACE&nbsp;</p>
              <p className="u-text u-text-body-alt-color u-text-default u-text-6">Current Blanace : 300987 FDH</p>
            </div></header>
          <section className="u-align-center u-black u-clearfix u-valign-middle-md u-valign-middle-sm u-valign-middle-xs u-section-1" id="carousel_8701">
            <div className="u-align-left u-clearfix u-sheet u-sheet-1">
              <div className="u-expanded-width u-tab-links-align-justify u-tabs u-tabs-1">
                <ul className="u-black u-spacing-10 u-tab-list u-unstyled u-tab-list-1" role="tablist">
                  <li className="u-tab-item u-tab-item-1" role="presentation">
                    <a className="active u-border-2 u-border-black u-button-style u-radius-50 u-tab-link u-text-active-black u-text-black u-white u-tab-link-1" id="link-tab-14b7" href="#tab-14b7" role="tab" aria-controls="tab-14b7" aria-selected="true">Town Center</a>
                  </li>
                  <li className="u-tab-item u-tab-item-2" role="presentation">
                    <a className="u-border-2 u-border-black u-button-style u-radius-50 u-tab-link u-text-active-black u-text-black u-white u-tab-link-2" id="link-tab-0da5" href="#tab-0da5" role="tab" aria-controls="tab-0da5" aria-selected="false">Army</a>
                  </li>
                  <li className="u-tab-item" role="presentation">
                    <a className="u-border-2 u-border-black u-button-style u-radius-50 u-tab-link u-text-active-black u-text-black u-white u-tab-link-3" id="link-tab-2917" href="#tab-2917" role="tab" aria-controls="tab-2917" aria-selected="false">War History</a>
                  </li>
                  <li className="u-tab-item u-tab-item-4" role="presentation">
                    <a className="u-border-2 u-border-black u-button-style u-radius-50 u-tab-link u-text-active-black u-text-black u-white u-tab-link-4" id="tab-6e5a" href="#link-tab-6e5a" role="tab" aria-controls="link-tab-6e5a" aria-selected="false">Balance History</a>
                  </li>
                </ul>
                <div className="u-tab-content">
                  <div className="u-align-left u-black u-container-style u-tab-active u-tab-pane u-tab-pane-1" id="tab-14b7" role="tabpanel" aria-labelledby="link-tab-14b7">
                    <div className="u-container-layout u-container-layout-1">
                      <p className="u-text u-text-default u-text-1">Pending Rewards</p>
                      <h5 className="u-text u-text-default u-text-2">
                        <span style={{fontWeight: 700}}>Town Center - Level 28</span>
                        <span style={{fontWeight: 700}} />
                      </h5>
                      <img className="u-border-7 u-border-white u-image u-image-circle u-image-1" src="images/Kingdom-Transparent-PNG.png" alt="" data-image-width={600} data-image-height={521} />
                      <a onClick={()=>console.log("click claim")} className="u-border-2 u-border-hover-palette-1-base u-border-palette-1-base u-btn u-btn-round u-button-style u-hover-palette-1-base u-none u-radius-50 u-btn-1">CLAIM</a>
                      <p className="u-text u-text-default u-text-3">2342 FDH</p>
                      <p className="u-text u-text-default u-text-4">
                        <span style={{fontWeight: 700}}>Income </span>: 18 FDH/s
                      </p>
                    </div>
                  </div>
                  <div className="u-align-left u-black u-container-style u-tab-pane u-tab-pane-2" id="tab-0da5" role="tabpanel" aria-labelledby="link-tab-0da5">
                    <div className="u-container-layout u-container-layout-2">
                      <img className="u-image u-image-circle u-preserve-proportions u-image-2" src="images/Avatar1.png" alt="" data-image-width={116} data-image-height={111} />
                      <h5 className="u-text u-text-default u-text-5"><b>LITTLE PENGUIN</b>
                      </h5>
                      <h5 className="u-text u-text-default u-text-6"><b>Owned&nbsp; &nbsp;:&nbsp; &nbsp;600 units</b>
                      </h5>
                      <h5 className="u-text u-text-default u-text-7"><b>ATTACK&nbsp; &nbsp;:&nbsp; &nbsp;<span style={{fontWeight: 400}}>12</span></b>
                      </h5>
                      <a className="u-border-none u-btn u-btn-round u-button-style u-hover-palette-4-light-2 u-palette-4-base u-radius-50 u-btn-2">MINT</a>
                      <h5 className="u-text u-text-default u-text-8"><b>Health : <span style={{fontWeight: 400}}>30</span></b>
                      </h5>
                      <div className="u-border-3 u-border-grey-dark-1 u-expanded-width u-line u-line-horizontal u-line-1" />
                      <img className="u-image u-image-circle u-preserve-proportions u-image-3" src="images/Avatar2.png" alt="" data-image-width={116} data-image-height={111} />
                      <h5 className="u-text u-text-default u-text-9"><b>STORM TROOPER</b>
                      </h5>
                      <h5 className="u-text u-text-default u-text-10"><b>Owned&nbsp; &nbsp;:&nbsp; &nbsp;200 units</b>
                      </h5>
                      <h5 className="u-text u-text-default u-text-11"><b>ATTACK&nbsp; &nbsp;:&nbsp; &nbsp;<span style={{fontWeight: 400}}>25</span></b>
                      </h5>
                      <a className="u-border-none u-btn u-btn-round u-button-style u-hover-palette-4-light-2 u-palette-4-base u-radius-50 u-btn-3">MINT</a>
                      <h5 className="u-text u-text-default u-text-12"><b>Health&nbsp; &nbsp;:&nbsp; &nbsp;7<span style={{fontWeight: 400}}>0</span></b>
                      </h5>
                      <div className="u-border-3 u-border-grey-dark-1 u-expanded-width u-line u-line-horizontal u-line-2" />
                    </div>
                  </div>
                  <div className="u-align-left u-black u-container-style u-tab-pane u-tab-pane-3" id="tab-2917" role="tabpanel" aria-labelledby="link-tab-2917">
                    <div className="u-container-layout u-container-layout-3">
                      <a className="u-btn u-btn-round u-button-style u-hover-palette-4-light-2 u-palette-4-base u-radius-50 u-btn-4"> WON [Against @amature]&nbsp; &nbsp;:&nbsp; &nbsp;+100,000 FDH</a>
                      <a className="u-border-none u-btn u-btn-round u-button-style u-hover-palette-2-light-2 u-palette-2-base u-radius-50 u-btn-5">LOST [AGAINST @ALPHAKINGDOM]&nbsp; :&nbsp; - 75,000 FDH</a>
                      <a className="u-border-none u-btn u-btn-round u-button-style u-hover-palette-4-light-2 u-palette-4-base u-radius-50 u-btn-6"> WON [Against @DELTAKINGDOM]&nbsp; &nbsp;:&nbsp; &nbsp;+10,000 FDH</a>
                      <a className="u-border-none u-btn u-btn-round u-button-style u-hover-palette-4-light-2 u-palette-4-base u-radius-50 u-btn-7"> WON [Against @LAZYLORD]&nbsp; &nbsp;:&nbsp; &nbsp;+100,000 FDH</a>
                      <a className="u-border-none u-btn u-btn-round u-button-style u-hover-palette-4-base u-radius-50 u-white u-btn-8">DRAW [Against @aLAMAKINGDOM]&nbsp; &nbsp;:&nbsp; &nbsp;+0 FDH</a>
                    </div>
                  </div>
                  <div className="u-align-left u-black u-container-style u-tab-pane u-tab-pane-4" id="link-tab-6e5a" role="tabpanel" aria-labelledby="tab-6e5a">
                    <div className="u-container-layout u-container-layout-4">
                      <a className="u-border-none u-btn u-btn-round u-button-style u-custom-color-2 u-hover-palette-4-light-2 u-radius-50 u-btn-9">HARVESTED&nbsp; &nbsp;:&nbsp; &nbsp;+50,000 FDH</a>
                      <a className="u-border-none u-btn u-btn-round u-button-style u-hover-palette-1-light-2 u-palette-1-base u-radius-50 u-btn-10">UPGRADE TOWN (LEVEL 30)&nbsp; :&nbsp; - 10,000,000 FDH</a>
                      <a className="u-border-none u-btn u-btn-round u-button-style u-hover-palette-3-light-2 u-palette-3-base u-radius-50 u-btn-11">mINTED 10 STROM TROPPER&nbsp; &nbsp;:&nbsp; &nbsp;-100,000 FDH</a>
                      <a className="u-border-none u-btn u-btn-round u-button-style u-hover-palette-3-light-2 u-palette-3-base u-radius-50 u-btn-12">MINTED 10 LITTLE PENGUIN&nbsp; &nbsp;:&nbsp; &nbsp;-50,000 FDH</a>
                      <a className="u-border-none u-btn u-btn-round u-button-style u-hover-palette-4-light-2 u-palette-4-base u-radius-50 u-btn-13">WON [Against @amature]&nbsp; &nbsp;:&nbsp; &nbsp;+100,000 FDH</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <footer className="u-align-center u-clearfix u-footer u-grey-80 u-footer" id="sec-aba5"><div className="u-align-left u-clearfix u-sheet u-sheet-1" /></footer>
        </div>
      );
  return htmlWeb;
}

export default App;

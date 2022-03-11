import React from "react";
import logo from "./logo.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Typography, Button } from "antd";
import { useMoralis, useWeb3Contract } from "react-moralis";
import abi from "../src/contracts/MasterContract.json";
import { BigNumber, ethers } from "ethers";
import {
  Footer,
  Blog,
  Possibility,
  Features,
  WhatGPT3,
  Header,
} from "./containers";
import { CTA, Brand, Navbar } from "./components";
import "./App.css";
import { GetContracts, GetGameConfig } from "./utils/contracts";
import { FadingHopeToken, KingdomNFT, MasterContract } from "./utils/typechain";
//import { type } from './../../../udemy-blockchain/Promisses/part 3/exoplanet-explorer/bower_components/hydrolysis/src/ast-utils/descriptors';
import{useForm} from "react-hook-form";

type Profile = {
  kindomname: string
  pinataurl: string
}

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
  let currentKingdom: PlayerKingdom = new PlayerKingdom();
  const gameConfig = GetGameConfig();
  
  // Set default value
  window.onload = () => onLoadWeb();
  const onLoadWeb = async () => {
    console.log("website loaded");
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x3" }], // chainId must be in hexadecimal numbers
    });
    [signer, master, token, kingdom] = await GetContracts();
    console.log("attaching contract ");
    await refresh();
  };

// Update text pending reward every 0.1s
  setInterval(() => {
    updatePendingRewards();
}, 1000);  
  
  function updatePendingRewards() {
    if(currentKingdom == undefined || currentKingdom.lastRewardTime == null || currentKingdom.townCenterLv.lt(1)) return;    
    const timeNow = Date.now().toString().substr(0, 10);
    const timePassed = currentKingdom.lastRewardTime.sub(timeNow).mul(-1);
    const income = gameConfig.GetBuildingConfig(currentKingdom.townCenterLv.toNumber()).IncomePerSec;
    setText("towncenter_rewards", "pending rewards: " + income.mul(timePassed).toString() + " FDH");
  }

  const { runContractFunction, isLoading } = useWeb3Contract({
    functionName: "freeMintWithURI",
    abi,
    contractAddress: "0x4AEAd9bEcF5F7794dF6618885c283F68b4a0C848",
    params: {
      account: "0x87e6eEDeb0494e3E3235F61AE4Cd393ef94F2FB2",
      kingdomName: document.getElementsByClassName("kingdomName"),
      uri: "pldosksmmm",
    },
  });
  const mintDirectly = async () => {
    // const provider = new ethers.providers.Web3Provider((window as any).ethereum , "any");
    const tx = await master.freeMintWithURI(
      await signer.getAddress(),
      document.getElementsByClassName("kingdomName").namedItem("kingdomName")
        ?.textContent || "asdsadas",
      document.getElementById("URI")?.textContent || ""
    );
    console.log("send tx");
    const result = await tx.wait();
    console.log("tx mined");
    console.log(result);
    await refresh();
  };

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
      currentKingdom.tokenId = await kingdom.tokenOfOwnerByIndex(playerAddress, 0);
      currentKingdom.name = await kingdom.getName(currentKingdom.tokenId);
      setText("tokenId", "tokenId: " + currentKingdom.tokenId.toString());
      setText("kingdom_name_desc", "kingdom: " + currentKingdom.name);
      currentKingdom.townCenterLv = await kingdom.getBuildingLevel(currentKingdom.tokenId, 0);
      setText("towncenter", "townLevel: " + currentKingdom.townCenterLv.toNumber());
      currentKingdom.lastRewardTime = await kingdom.getLastClaimTime( currentKingdom.tokenId);
      // setText("tc_lastClaimTime", "lastClaimTime: " + currentKingdom.lastRewardTime.toNumber());


      const income = gameConfig.GetBuildingConfig(currentKingdom.townCenterLv.toNumber()).IncomePerSec;
      setText("towncenter_income", "income: " + income.toString() + "/s");

      setText("towncenter_upgradecost", "upgrade cost: " + gameConfig.GetBuildingConfig(currentKingdom.townCenterLv.toNumber()).TownCost.toString() + " FDH");
    } else {
      console.log("no token kingdom NFT owned");
      setText("kingdom_name_desc", "You control no kingdom. Mint some.");
      setText("tokenId", "You control no kingdom. Mint some.");
    }

    currentKingdom.balance = await token.balanceOf(playerAddress);
    setText("balance", "balance: " + currentKingdom.balance.toString() + " FDH");

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
  }

  function setText(id: string, value: string) {
    const doc = document.getElementById(id);
    if (doc != null) doc.textContent = value;
  }

  const {handleSubmit} = useForm<Profile>()

  const onSubmit = handleSubmit((data)=>{
    alert(JSON.stringify(data))
  })
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
            
            <input
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
            </Button>
            <form onSubmit={onSubmit}>
              <div>
                <label htmlFor="kindomname">Kindom Name</label>
                <input id="kindomname" name="kindomname" type="text"/>
              </div>
              <div>
                <label htmlFor="pinataurl">NFT URL</label>
                <input id="pinataurl" name="pinataurl" type="text"/>
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
          {/* <p id="tc_lastClaimTime"></p> */}
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

import React from "react";
import logo from "./logo.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Typography, Button } from "antd";
import { useMoralis, useWeb3Contract } from "react-moralis";
import abi from "../src/contracts/MasterContract.json";
import { ethers } from "ethers";
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
import {GetContracts} from "./utils/contracts";

function App() {
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
    const provider = new ethers.providers.Web3Provider((window as any).ethereum , "any");
    const [master, token, kingdom] = await GetContracts(provider);
    await master.freeMintWithURI("0x87e6eEDeb0494e3E3235F61AE4Cd393ef94F2FB2", "kingdomName","pldosksmmm");
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
            <Button
              type="primary"
              shape="round"
              size="large"
              style={{ width: "100%" }}
              loading={isLoading}
              onClick={() => runContractFunction()}
            >
              MINT
            </Button>
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
          </Card>
          <Footer />
        </div>
        {/* <div>
        <Button onClick={refresh}>refresh profile</Button>
        <p id="player">Player Profile:</p>
        <p id="owner">owner:</p>
        <p id="tokenId">tokenId:</p>        
        <p id="Kingdom_name">Kingdom:</p>        
        <p id="towncenter">Town Center lv 0</p>
        <p id="towncenter_income">Income: </p>
        <p id="towncenter_rewards">Pending rewards</p>
        <Button onClick={claimReward}>Claim</Button>
        </div> */}
      </div>
    </div>
  );
  return htmlWeb;
}

export default App;

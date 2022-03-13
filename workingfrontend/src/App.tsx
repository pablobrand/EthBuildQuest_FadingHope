/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, Component } from "react";
import logo from "./logo.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import abi from "../src/contracts/MasterContract.json";
import { BigNumber, ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import {
  Blog,
  Features,
  Footer,
  Header,
  Possibility,
  WhatGPT3,
} from "./containers";
import "./App.css";
import { GetContracts, GetGameConfig } from "./utils/contracts";
import { FadingHopeToken, KingdomNFT, MasterContract } from "./utils/typechain";
import { useForm } from "react-hook-form";
// import { Button, Card, Typography } from "antd";
import { Card, Box, Button, Typography } from "@mui/material";
import { Brand, CTA, Navbar } from "./components";
import UploadImage from "./components/MintingForm/MintingForm";
import { Dropdown } from "react-bootstrap";

import FormData from "form-data";
import axios from "axios";
type Profile = {
  kingdomName: string;
  kingdomDescription: string;
};

class PlayerKingdom {
  owner!: string;
  balance!: BigNumber;
  tokenId!: BigNumber;
  name!: string;
  uri!: string;
  metadata!: any;
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
    const provider = await refreshContractConnection();
    console.log("attaching contract ");
    await refresh();

    provider.on("accountsChanged", (accounts) => refresh());
    provider.on("chainChanged", (chain) => refresh());
  };

  // Update text pending reward every 0.1s
  setInterval(() => {
    updatePendingRewards();
    if (signer == undefined || signer == null) refreshContractConnection();
  }, 1000);

  async function refreshContractConnection() {
    const provider = (await detectEthereumProvider()) as any;
    console.log(provider.networkVersion, "window.ethereum.networkVersion");
    await ConnectToNetwork(provider.networkVersion);
    return provider;
  }

  async function ConnectToNetwork(network: string) {
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
    console.log("connect to network " + networkName);
    [signer, master, token, kingdom] = await GetContracts(networkName);
    console.log("contracts attached");
    console.log("signer:", signer);
    console.log("master:", master.address);
    console.log("token:", token.address);
    console.log("kingdom:", kingdom.address);
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
    if (signer == undefined) await refreshContractConnection();
    const playerAddress = await signer.getAddress();
    currentKingdom.owner = playerAddress;
    const tokenOwnedCount = await kingdom.balanceOf(playerAddress);

    setText("owner", "owner: " + currentKingdom.owner);

    if (tokenOwnedCount.gt(0)) {
      console.log("found NFT kingdom owner by player address", playerAddress);
      currentKingdom.tokenId = await kingdom.tokenOfOwnerByIndex(
        playerAddress,
        0
      );
      currentKingdom.name = await kingdom.getName(currentKingdom.tokenId);
      setText("tokenId", "tokenId: " + currentKingdom.tokenId.toString());
      setText("kingdom_name_desc", "Kingdom Name: " + currentKingdom.name);
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
            .GetBuildingConfig(currentKingdom.townCenterLv.add(1).toNumber())
            .TownCost.toString() +
          " FDH"
      );

      currentKingdom.uri = await kingdom.tokenURI(currentKingdom.tokenId);
      console.log("uri: " + currentKingdom.uri);
      const uriLink = "https://gateway.pinata.cloud/ipfs/" +currentKingdom?.uri.replace("ipfs://", "");
      console.log("uriLink: " + uriLink);
      const metadata = (await axios.get(uriLink)).data;
      console.log(metadata);
      currentKingdom.metadata = metadata;
      setText(
        "description",
        "description: " + currentKingdom.metadata.description
      );
      
    } else {
      console.log("player have no token kingdom NFT owned");
      // setText("kingdom_name_desc", "You control no kingdom. Mint some.");
      setText("tokenId", "You control no kingdom. Mint some.");
    }

    currentKingdom.balance = await token.balanceOf(playerAddress);
    setText(
      "balance",
      "balance: " + currentKingdom.balance.toString() + " FDH"
    );
    console.log("kingdom object data:");
    console.log(currentKingdom);
  };

  const claimReward = async () => {
    const tx = await master.ClaimKingdomReward(
      currentKingdom.tokenId.toNumber()
    );
    console.log("send tx");
    const result = await tx.wait();
    console.log("tx mined");
    console.log(result);
    await refresh();
  };

  const upgradeTownCenter = async () => {
    const tx = await master.UpgradeKingdomBuilding(
      currentKingdom.tokenId.toNumber(),
      0
    );
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

  //const pinataSDK=require('@pinata/sdk')
  //const [folderUrl, setFolderUrl] = useState("");
  const [file, setFile] = useState();
  const [selectedFile, setSelectedFile] = useState(undefined);
  const [myipfsHash, setIPFSHASH] = useState("");

  // give back ipfs hash
  const sendFileToIPFS = async (fileToHandle) => {
    console.log("starting sending file");
    console.log(fileToHandle);
    // initialize the form data
    const formData = new FormData();
    // append the file form data to
    formData.append("file", fileToHandle);

    // call the keys from .env

    // PINATA KEY
    // API Key: 21b8f547a35cb4ccb895
    // API Secret: 5db4ec639733e7f156dba2ddb4a3d466cd3842e313d6164be594e1127693fe0d
    // JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4ZDAxMTk2Ni05ODViLTRmMDktOWE4Mi0zMjRhZGY3ZTk0MDAiLCJlbWFpbCI6InZhZHByaW1hcnlAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZX0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjIxYjhmNTQ3YTM1Y2I0Y2NiODk1Iiwic2NvcGVkS2V5U2VjcmV0IjoiNWRiNGVjNjM5NzMzZTdmMTU2ZGJhMmRkYjRhM2Q0NjZjZDM4NDJlMzEzZDYxNjRiZTU5NGUxMTI3NjkzZmUwZCIsImlhdCI6MTY0NzEwODQ2MX0.MscHiw3H6ATSr6X8XWUEs8m4Aaxv1S6Vx_DBgGTSP6E

    const API_KEY = process.env.REACT_APP_API_KEY;
    const API_SECRET = process.env.REACT_APP_API_SECRET;
    //const pinata=pinataSDK(API_KEY,API_SECRET)
    // the endpoint needed to upload the file
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    console.log(formData);
    console.log((formData as any)._boundary);
    const response = await axios.post(url, formData, {
      // maxContentLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data;boundary=${
          (formData as any)._boundary
        }`,
        pinata_api_key: "21b8f547a35cb4ccb895",
        pinata_secret_api_key:
          "5db4ec639733e7f156dba2ddb4a3d466cd3842e313d6164be594e1127693fe0d",
      },
    });
    console.log("pinata response");
    console.log(response);

    // get the hash
    setIPFSHASH(response.data.IpfsHash);

    return "ipfs://" + response.data.IpfsHash;
  };
  // give back ipfs link
  const pinJsonToIPFS = async (json) => {
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    const response = await axios.post(url, json, {
      headers: {
        pinata_api_key: "21b8f547a35cb4ccb895",
        pinata_secret_api_key:
          "5db4ec639733e7f156dba2ddb4a3d466cd3842e313d6164be594e1127693fe0d",
      },
    });
    console.log("pinata response");
    console.log(response);
    return "ipfs://" + response.data.IpfsHash;
  };

  const changeHandler = (event) => {
    //(event)=>setFile(event.target.files[0])
    // console.log(event);
    // console.log(event.target.files);
    console.log(event.target.files[0]);
    setFile(event.target.files[0]);
    // setSelectedFile(event.target.files[0].name);
  };

  //form section
  const { register, handleSubmit } = useForm<Profile>();

  const onMintingNFT = handleSubmit(async (data) => {
    console.log("checking master address" + master.address);
    console.log(file);
    // return;
    const imgIpfsFile = await sendFileToIPFS(file);
    const metadata = {
      name: data.kingdomName,
      description: data.kingdomDescription,
      image: imgIpfsFile,
    };
    console.log("send ipfs this data");
    console.log(metadata);
    const metadataFile = await pinJsonToIPFS(metadata);

    const tx = await master.freeMintWithURI(
      await signer.getAddress(),
      data.kingdomName,
      metadataFile
    );

    console.log("send tx");
    const result = await tx.wait();
    console.log("tx mined");
    console.log(result);
    await refresh();
  });

  //front end html
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
                <Dropdown.Item onClick={() => ConnectToNetwork("Ropsten")}>
                  Ropsten Testnet
                </Dropdown.Item>
                <Dropdown.Item onClick={() => ConnectToNetwork("Rinkeby")}>
                  Rinkeby Testnet
                </Dropdown.Item>
                <Dropdown.Item onClick={() => ConnectToNetwork("mumbai")}>
                  Matic/Polygon Testnet
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => ConnectToNetwork("optimistic kovan")}
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
        <div style={{ display: "contents" }}>
          <Card>
            <Box sx={{ p: 2, display: "contents", position: "center" }}>
              <Typography>NFT Minter</Typography>
              {
                //  render the hash
                myipfsHash.length > 0 && (
                  <img
                    height="200"
                    src={`https://gateway.pinata.cloud/ipfs/${myipfsHash}`}
                    alt="not loading"
                  />
                )
              }
              <form onSubmit={onMintingNFT}>
                <div>
                  <label htmlFor="kingdomName">Kingdom Name</label>
                  <input
                    id="kingdomName"
                    type="text"
                    {...register("kingdomName", {})}
                  />
                </div>
                <div>
                  <label htmlFor="kingdomDescription">
                    Kingdom Description
                  </label>
                  <input
                    id="kingdomDescription"
                    type="text"
                    {...register("kingdomDescription", {})}
                  />
                </div>
                <div>
                  <input
                    type="file"
                    value={selectedFile}
                    // onChange={(event) => setFile(event?.target?.files[0] as any)}
                    onChange={changeHandler}
                  />
                  {/* <button onClick={() => handleFile(file)}>Pin</button> */}
                </div>
                <button type="submit" color="success">
                  Mint NFT
                </button>
              </form>
            </Box>
          </Card>
        </div>
        <div>
          <Button onClick={refresh}>refresh profile</Button>
          <p id="player" style={{ color: "white" }}>
            Player Profile
          </p>
          {
            //  render the hash
            
            currentKingdom?.metadata?.image > 8 && (
                <img
                  height="200"
                  src={`https://gateway.pinata.cloud/ipfs/${currentKingdom.metadata.image.replace(
                    "ipfs://",
                    ""
                  )}`}
                  alt="not loading"
                />
              )
          }
          <p id="owner" style={{ color: "white" }}>
            owner:
          </p>
          <p id="kingdom_name_desc" style={{ color: "white" }}>
            Kingdom:
          </p>
          <p id="description" style={{ color: "white" }}>
            description:
          </p>
          <p id="tokenId" style={{ color: "white" }}>
            tokenId:
          </p>
          <p id="balance" style={{ color: "white" }}>
            balance:
          </p>
          <p id="towncenter" style={{ color: "white" }}>
            Town Center lv -1
          </p>
          <p id="towncenter_income" style={{ color: "white" }}>
            Income:{" "}
          </p>
          <p id="towncenter_rewards" style={{ color: "white" }}>
            Pending rewards
          </p>
          <Button onClick={claimReward}>Claim</Button>
          <p id="towncenter_upgradecost" style={{ color: "white" }}>
            Towncenter upgrade cost:
          </p>
          <Button onClick={upgradeTownCenter}>Upgrade town center</Button>
        </div>
      </div>
    </div>
  );
  return htmlWeb;
}

export default App;

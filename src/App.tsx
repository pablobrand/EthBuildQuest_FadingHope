import React from 'react';
import logo from './logo.svg';
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Typography, Button } from "antd";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi } from "../src/contracts/sla.json";
import {
  Footer,
  Blog,
  Possibility,
  Features,
  WhatGPT3,
  Header,
} from "./containers";
import { CTA, Brand, Navbar } from "./components";
import './App.css';


function App() {

  const { runContractFunction, isLoading } = useWeb3Contract({
    functionName: "freeMintURI",
    abi,
    contractAddress: "0xC34541DEec223F4a24bD7Eeda28D56cA16c927fd",
    params: {
      account:"",
      kingdomName: document.getElementsByClassName('kingdomName'),
      uri: "pldosksmmm",
    },
  });

    const { authenticate, isAuthenticated, isAuthenticating, user, account, logout } = useMoralis();

    const login = async () => {
      if (!isAuthenticated) {

        await authenticate({signingMessage: "Log in using Moralis" })
          .then(function (user) {
            console.log("logged in user:", user);
            console.log(user!.get("ethAddress"));
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }

    const logOut = async () => {
      await logout();
      console.log("logged out");
    }

  return (
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
        <Header />

        <Brand />
        <WhatGPT3 />
        <Features />
        <Possibility />
        <CTA />
        <Blog />
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
        <input id="kingdomName" type="text" className="form-control" placeholder="Kingdom Name" aria-label="kingdomName" aria-describedby="basic-addon1"/>
        <input id="URI" type="text" className="form-control" placeholder="URI" aria-label="URI" aria-describedby="basic-addon1"/>
      </Card>
        <Footer />
      </div>
      </div>
      </div>
  );
}

  export default App;
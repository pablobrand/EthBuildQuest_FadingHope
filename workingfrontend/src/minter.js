import React from "react";
import { Card, Typography, Button } from "antd";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi } from "../contracts/sla.json";




export default function QuickStart() {
  const { account } = useMoralis();
  const { runContractFunction, isLoading } = useWeb3Contract({
    functionName: "freeMintURI",
    abi,
    contractAddress: "0xC34541DEec223F4a24bD7Eeda28D56cA16c927fd",
    params: {
      account,
      kingdomName: document.getElementById("kingdomName").setAttribute("disabled", null),
      uri: "pldosksmmm",
    },
  });







  return (
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
        <input id="kingdomName" type="text" class="form-control" placeholder="Kingdom Name" aria-label="kingdomName" aria-describedby="basic-addon1"/>
        <input id="URI" type="text" class="form-control" placeholder="URI" aria-label="URI" aria-describedby="basic-addon1"/>
      </Card>
    </div>
  );
}

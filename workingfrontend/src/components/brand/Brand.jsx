import React from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import { pinata, valist, moralis, ipfs, chainlink, immutable } from "./imports";
import "./brand.css";

const Brand = () => (
  <div align="center" width="150" height="150" borderRadius="50%">
    <ButtonGroup size="small" aria-label="small button group" align="center">
      <Button title="Pinata" borderRadius="50%">
        <a href="https://www.pinata.cloud/" target="_blank">
          <img
            src={pinata}
            width="150"
            height="150"
            style={{ width: 150, height: 150, borderRadius: 200 / 2 }}
          />
        </a>
      </Button>
      <Button title="Valist">
        <a href="https://valist.io/" target="_blank">
          <img
            src={valist}
            width="150"
            height="150"
            style={{ width: 150, height: 150, borderRadius: 200 / 2 }}
          />
        </a>
      </Button>
      <Button title="Moralis">
        <a href="https://moralis.io/" target="_blank">
          <img
            src={moralis}
            width="150"
            height="150"
            style={{ width: 150, height: 150, borderRadius: 200 / 2 }}
          />
        </a>
      </Button>
      <Button title="IPFS">
        <a href="https://ipfs.io/" target="_blank">
          <img
            src={ipfs}
            width="150"
            height="150"
            style={{ width: 150, height: 150, borderRadius: 200 / 2 }}
          />
        </a>
      </Button>
      <Button title="Chainlink">
        <a href="https://chain.link/" target="_blank">
          <img
            src={chainlink}
            width="150"
            height="150"
            style={{ width: 150, height: 150, borderRadius: 200 / 2 }}
          />
        </a>
      </Button>
      <Button title="Immutable X">
        <a href="https://www.immutable.com/" target="_blank">
          <img
            src={immutable}
            width="150"
            height="150"
            style={{ width: 150, height: 150, borderRadius: 200 / 2 }}
          />
        </a>
      </Button>
    </ButtonGroup>
  </div>
);

export default Brand;

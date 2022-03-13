import React from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import { pinata, polygon, moralis, ipfs, quixotic } from "./imports";
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
      <Button title="Polygon-Studios">
        <a href="https://polygonstudios.com/" target="_blank">
          <img
            src={polygon}
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
      <Button title="Quixotic">
        <a href="https://quixotic.io/" target="_blank">
          <img
            src={quixotic}
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

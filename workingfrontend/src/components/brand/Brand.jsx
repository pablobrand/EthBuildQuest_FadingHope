import React from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import { pinata, valist, moralis, ipfs, chainlink, immutable } from './imports';
import './brand.css';

const Brand = () => (
  <div align="center" width="150" height="150">
    <ButtonGroup size="small" aria-label="small button group" align="center">
      <Button title="Pinata">
        <img
          src={pinata}
          width="150"
          height="150"
          style={{ width: 150, height: 150, borderRadius: 200 / 2 }}
        />
      </Button>
      <Button title="Valist">
        <img
          src={valist}
          width="150"
          height="150"
          style={{ width: 150, height: 150, borderRadius: 200 / 2 }}
        />
      </Button>
      <Button title="Moralis">
        <img
          src={moralis}
          width="150"
          height="150"
          style={{ width: 150, height: 150, borderRadius: 200 / 2 }}
        />
      </Button>
      <Button title="IPFS">
        <img
          src={ipfs}
          width="150"
          height="150"
          style={{ width: 150, height: 150, borderRadius: 200 / 2 }}
        />
      </Button>
      <Button title="Chainlink">
        <img
          src={chainlink}
          width="150"
          height="150"
          style={{ width: 150, height: 150, borderRadius: 200 / 2 }}
        />
      </Button>
      <Button title="Immutable X">
        <img
          src={immutable}
          width="150"
          height="150"
          style={{ width: 150, height: 150, borderRadius: 200 / 2 }}
        />
      </Button>
    </ButtonGroup>
  </div>
);

export default Brand;

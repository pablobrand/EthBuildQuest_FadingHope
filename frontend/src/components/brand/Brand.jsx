import React from 'react';
import { pinata, valist, moralis, ipfs, chainlink } from './imports';
import './brand.css';

const Brand = () => (
  <div className="gpt3__brand section__padding">
    <div>
      <img src={pinata} />
    </div>
    <div>
      <img src={valist} />
    </div>
    <div>
      <img src={moralis} />
    </div>
    <div>
      <img src={ipfs} />
    </div>
    <div>
      <img src={chainlink} />
    </div>
  </div>
);

export default Brand;

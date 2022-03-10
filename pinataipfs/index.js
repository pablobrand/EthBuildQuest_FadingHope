const Moralis = require("moralis/node");
const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(
  "d6e2f9302b5b4afb0d00",
  "cdc888e3f680562e4c97df3feefd41e91bb3f70d450e90fb3cadd377223c1847"
);


const fs = require("fs");
const readableStreamForFile = fs.createReadStream("./blue_dog.jpeg");
const options = {
  pinataMetadata: {
    name: "blue",
    keyvalues: {
      customKey: "customValue",
      customKey2: "customValue2",
    },
  },
  pinataOptions: {
    cidVersion: 0,
  },
};
pinata
  .pinFileToIPFS(readableStreamForFile, options)
  .then((result) => {
    //handle results here
    console.log("https://gateway.pinata.cloud/ipfs/"+result.IpfsHash);
  })
  .catch((err) => {
    //handle error here
    console.log(err);
  });
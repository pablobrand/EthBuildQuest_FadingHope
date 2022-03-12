/* eslint-disable @typescript-eslint/no-var-requires */
const process = require("process");
const fs = require("fs");
const pinataSDK = require("@pinata/sdk");
const PINATA_API_KEY = "d4c25993ac5bef2a6460";
const PINATA_SECRET_API_KEY =
  "4465eed9e122833977403900c8f65045f8cb91adcc77d18b7c6f541ef4ff78b6";
const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);

var imgPath = process.argv[2];
const readableStreamForFile = fs.createReadStream(imgPath);
const options = {};

pinata
  .pinFileToIPFS(readableStreamForFile, options)
  .then((result) => {
    console.log(result["IpfsHash"]);
  })
  .catch((err) => {
    console.log(err);
  });

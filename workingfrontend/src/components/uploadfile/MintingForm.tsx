import React, { useState } from "react"; 
import { FileUploader } from "react-drag-drop-files";
import pinataSDK from "@pinata/sdk";
import * as fs from 'fs';

const pinata = pinataSDK(
  "d6e2f9302b5b4afb0d00",
  "cdc888e3f680562e4c97df3feefd41e91bb3f70d450e90fb3cadd377223c1847"
);
import { Button, Form } from 'react-bootstrap';

const fileTypes = ["JPG", "PNG", "GIF"];
const FormMint = () => {
    
    const [file, setFile] = useState(null);
    const handleChange = (file: null) => {
        setFile(file);
        //console.log("file uploade: " + fs.readFileSync(file))
        const readableStreamForFile = fs.createReadStream(file);
        pinata.pinFileToIPFS(readableStreamForFile).then((result) => {
                //handle results here
                console.log("https://gateway.pinata.cloud/ipfs/"+result.IpfsHash);
            })
            .catch((err: any) => {
                //handle error here
                console.log(err);
            });
    }
    

  return (
    <FileUploader handleChange={handleChange} name="file" types={fileTypes} />  
  );
};

export default FormMint;
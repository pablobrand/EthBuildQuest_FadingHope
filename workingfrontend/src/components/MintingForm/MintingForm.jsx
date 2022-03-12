import React, { useState } from "react"; 
import { FileUploader } from "react-drag-drop-files";
//import axios from "@axios";
//import pinataSDK from "@pinata/sdk"
//import * as fs from 'fs';

// const pinata = pinataSDK(
//   "d6e2f9302b5b4afb0d00",
//   "cdc888e3f680562e4c97df3feefd41e91bb3f70d450e90fb3cadd377223c1847"
// );
//const fs = require("fs");

const UploadImage = () => { 
  const fileTypes = ["JPG", "PNG", "GIF"];
  const [file, setFile] = useState(null);
  const handleChange = (file) => {
  setFile(file);
  console.log("this is the file uploaded:" + file);
};
      
    return (
      <div>
        <FileUploader
            multiple={false}
            handleChange={handleChange}
            name="NFTImage"
            types={fileTypes}
          />
        </div>
    );

};

export default UploadImage;
import { useState } from "react";
import FormData from "form-data";
import axios from "axios";
//import { FolderUpload } from "react-ipfs-uploader";
//import fs from 'fs';
//const fs = require('fs');

function AppUpload() {
  //const pinataSDK=require('@pinata/sdk')
  //const [folderUrl, setFolderUrl] = useState("");
  const [file, setFile] = useState();
  const [selectedFile, setSelectedFile] = useState("");
  const [myipfsHash, setIPFSHASH] = useState("");

  const changeHandler = (event) => {
    //(event)=>setFile(event.target.files[0])
    setFile(event.target.files[0]);
    //setIsSelected(true);
  };
  const handleFile = async (fileToHandle) => {

    console.log("starting");

    // initialize the form data
    const formData = new FormData();

    // append the file form data to 
    formData.append("file", fileToHandle);

    // call the keys from .env

    const API_KEY = process.env.REACT_APP_API_KEY;
    const API_SECRET = process.env.REACT_APP_API_SECRET;
    //const pinata=pinataSDK(API_KEY,API_SECRET)
    // the endpoint needed to upload the file
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    console.log(formData);
    const response = await axios.post(
      url,
      formData,
      {
        maxContentLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data;boundary=${formData._boundary}`,
          "pinata_api_key": "d6f95d9e9aa8496fbfc7",
          "pinata_secret_api_key": "7640b56dee9b2db26af10ae2000b169b17ed13925a9254160d956e2d5d989c41"

        }
      }
    );

    console.log(response);

    // get the hash
    setIPFSHASH(response.data.IpfsHash);


  };



  return (
    // <div class="container" className="App" style={{ justifyContent:'center', alignItems:'center', height: '500vh', scrollMargin:true}}>
    //   <FolderUpload setUrl={setFolderUrl} />
    //   FolderUrl :{" "}
    //   <a href={folderUrl} target="_blank" rel="noopener noreferrer" onClick={()=>handleFile(folderUrl)}>
    //     {folderUrl}
    //   </a>
    //   {
    //     //  render the hash
    //     myipfsHash.length > 0 && <img height='200' src={`https://gateway.pinata.cloud/ipfs/${myipfsHash}`} alt='not loading'/>
    //     }
    // </div>

    <div className="AppUpload">
      <input type="file" value={selectedFile} onChange={(event) => setFile(event.target.files[0])} />
      <button onClick={() => handleFile(file)}>Pin</button>
      {
        //  render the hash
        myipfsHash.length > 0 && <img height='200' src={`https://gateway.pinata.cloud/ipfs/${myipfsHash}`} alt='not loading' />
      }
    </div>
  );
}

export default AppUpload;
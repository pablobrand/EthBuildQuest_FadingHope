import React, {useState} from "react";
import { useForm } from "react-hook-form";
import { FileUploader } from "react-drag-drop-files";
import $ from "jquery";
import * as fs from 'fs';
import fetch from 'node-fetch';
import axios from 'axios';
//import { fetch } from 'isomorphic-fetch';
import FormData from 'form-data';
//const fs = require('fs');
//const fetch = require('node-fetch');
//const FormData = require('form-data');

export default function MintForm(){
    
    const fileTypes = ["JPG", "PNG", "GIF"];
    const [file, setFile] = useState(null);
    const handleChange = (file) => {
      setFile(file);
    };
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = (data, file) => {
        const kindomName = data
        //console.log(data);
        //console.log(file);
        const form = new FormData();
        const fileStream = fs.createReadStream(file);
        form.append('NFT_Image', fileStream);
        const options = {
            method: 'POST',
            body: form,
            headers: {
              "Authorization": "3efef893-e655-4483-9721-bc9342f885db",
            },
          };
          fetch("https://api.nftport.xyz/v0/files", options)
            .then(response => {
                return response.json()
            })
            .then(responseJson => {
                // Handle the response
                console.log(responseJson);
            })
    };
    console.log(watch("kindomname")); // watch input value by passing the name of it

    return (
        /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* register your input into the hook by invoking the "register" function */}
          <input defaultValue="Kindom Name" {...register("kindomname")} />
          <FileUploader handleChange={handleChange} name="file" types={fileTypes} multiple={false} />
          <input type="submit" />
        </form>
      );

}

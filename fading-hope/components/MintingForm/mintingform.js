import React, {useState} from "react";
import { useForm } from "react-hook-form";
import { FileUploader } from "react-drag-drop-files";
import {Button, Form, Row, Col} from 'react-bootstrap';
import $ from "jquery";
// import * as fs from 'fs';
// import fetch from 'node-fetch';
// import axios from 'axios';
//import { fetch } from 'isomorphic-fetch';
import FormData from 'form-data';
//const fs = require('fs');
//const fetch = require('node-fetch');
//const FormData = require('form-data');

export default function MintForm(){
    
    const fileTypes = ["JPG", "PNG", "GIF"];
    const [fileUpload, setFile] = useState(null);
    const handleChange = (file) => {
      setFile(fileUpload);
      //console.log("file from handlechange"+JSON.stringify(file));
      const refile = JSON.stringify(fileUpload);
      console.log("fileUploded from handlechange: "+JSON.stringify(fileUpload));
      console.log("fileUploded from refile: "+refile);
    };
    
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = () => {
        //console.log("fileUploded from outside: "+JSON.stringify(refile));
        const kindomName = data
        console.log("data from onSubmit"+data);
        console.log("file from onSubmit"+refile);
        // const form = new FormData();
        // const fileStream = fs.createReadStream(file);
        // form.append('NFT_Image', fileStream);
        // const options = {
        //     method: 'POST',
        //     body: form,
        //     headers: {
        //       "Authorization": "3efef893-e655-4483-9721-bc9342f885db",
        //     },
        //   };
        //   fetch("https://api.nftport.xyz/v0/files", options)
        //     .then(response => {
        //         return response.json()
        //     })
        //     .then(responseJson => {
        //         // Handle the response
        //         console.log(responseJson);
        //     })
        console.log("fileRead: "+fileUpload)

        const form = new FormData();
        form.append("file", fileUpload);
        //console.log("value from form"+form);
        const settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://api.nftport.xyz/v0/files",
            "method": "POST",
            "headers": {
            "Content-Type": "multipart/form-data",
            "Authorization": "3efef893-e655-4483-9721-bc9342f885db"
            },
            "processData": false,
            "contentType": false,
            "mimeType": "multipart/form-data",
            "form": form
        };
        console.log("setting.data: "+settings.data);
        console.log("form: "+form);
        $.ajax(settings).done(function (response) {
            console.log(response);
        });
    };
    //console.log(watch("kindomname")); // watch input value by passing the name of it

    return (
        /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col>
              <Form.Control placeholder="Kindom Name" {...register("kindomname")} />
            </Col>
            <Col>
              <FileUploader handleChange={handleChange} name="file" types={fileTypes} multiple={false} />
            </Col>
            <Col>
              <Button type="submit" variant="primary">Submit</Button>
            </Col>
          </Row>
        </Form>
      );

}

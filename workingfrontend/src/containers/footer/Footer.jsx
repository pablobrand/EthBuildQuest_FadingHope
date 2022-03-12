import React from "react";
import "./footer.css";
import { Button } from "react-bootstrap";

const Footer = () => {
return (
  <form>
    <label>
      Name:
      <input type="text" name="name" />
    </label>
    <label>
      File:
      <input type="file" name="file" />
    </label>
    <Button>Upload</Button>
  </form>
);
};

export default Footer;

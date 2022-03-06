import React, { useState } from 'react';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import logo from '../../assets/fh.png';
import './navbar.css';

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);

  return (
    <div className="gpt3__navbar">
      <div className="gpt3__navbar-links">
        <div className="gpt3__navbar-links_logo">
          <img src={logo} />
        </div>
        <div className="gpt3__navbar-links_container">
          <p>
            <a href="#home">Demo</a>
          </p>
          <p>
            <a href="#wgpt3">Play To Earn</a>
          </p>
          <p>
            <a href="#possibility">Roadmap</a>
          </p>
          <p>
            <a href="#features">Sponsors</a>
          </p>
          <p>
            <a href="#blog">About</a>
          </p>
        </div>
      </div>
      <div>
        <Button>Play & Earn</Button>
      </div>
      <div className="gpt3__navbar-menu">
        {toggleMenu ? (
          <RiCloseLine
            color="#fff"
            size={27}
            onClick={() => setToggleMenu(false)}
          />
        ) : (
          <RiMenu3Line
            color="#fff"
            size={27}
            onClick={() => setToggleMenu(true)}
          />
        )}
        {toggleMenu && (
          <div className="gpt3__navbar-menu_container scale-up-center">
            <div className="gpt3__navbar-menu_container-links">
              <p>
                <a href="#home">Demo</a>
              </p>
              <p>
                <a href="#wgpt3">Play To Earn</a>
              </p>
              <p>
                <a href="#possibility">Roadmap</a>
              </p>
              <p>
                <a href="#features">Sponsors</a>
              </p>
              <p>
                <a href="#blog">About</a>
              </p>
            </div>
            <div className="gpt3__navbar-menu_container-links-sign">
              <div to="/login">
                <p>Sign in</p>
              </div>
              <button type="button">Sign up</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;

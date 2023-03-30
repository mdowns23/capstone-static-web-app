import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import logo from './Capture.png'
import './nav.css'

function Navigation() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <img src={logo} alt="Road Trip Planner Logo" className="navbar-logo" />
        <ul className="navbar-links">
          <li className="navbar-link"><a href="#">Home</a></li>
          {/* <li className="navbar-link"><a href="#">About</a></li>
          <li className="navbar-link"><a href="#">Destinations</a></li>
          <li className="navbar-link"><a href="#">Contact</a></li> */}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
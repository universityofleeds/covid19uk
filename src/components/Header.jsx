import React, { useState } from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';

import logob from "../img/uol-logo-black.png"; 
import logobs from "../img/uol-sml-black.png"; 

const navs = [
  // {
  //   key: 1,
  //   to: "world",
  //   title: "World"
  // },
  {
    key: 1,
    to: "about",
    title: "About"
  },
];

function Header(props) {
  const [dark, setDark] = useState(props.dark)
  return (
    <Navbar inverse={dark} collapseOnSelect>
      <Nav pullRight>
        <Link to="/">
          <img className="logo-standard" style={{ height: "46px", maxHeight: "46px" }}
            src={!dark ? logob : "https://lida.leeds.ac.uk/wp-content/themes/lida/resources/images/uol-logo.png"} />
          <img className="logo-mobile" style={{ height: "46", maxHeight: "46" }}
            src={!dark ? logobs : "https://lida.leeds.ac.uk/wp-content/themes/lida/resources/images/uol-logo-sml.png"} />
        </Link>
      </Nav>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav pullLeft>
          {
            navs.map((item, i) => {
              return (
                <NavItem
                  key={i}
                  eventKey={item.key}
                  onClick={() => props.history.push(item.to)}>
                  {item.title}
                </NavItem>
              )
            })
          }
          <NavItem href="https://github.com/layik/eAtlas" 
          className="ghbutton">
            <i style={{ fontSize: '1.5em' }} className="fa fa-github"></i>
          </NavItem>
          <NavItem onClick={() => {
            typeof props.toggleTheme === 'function' && props.toggleTheme()
            setDark(!dark)
          }} className="themebutton">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <g transform="matrix( 1 0 0 1 4 1 )">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M15.3999 11C15.7999 10.1 16 9 16 8C16 3.6 12.4 0 8 0C3.6 0 0 3.6 0 8C0 9.1 0.200098 10.1 0.600098 11L2.19995 15L13.8 15L15.3999 11ZM11 22L12.6001 18L3.3999 18L5 22L11 22Z" fill={
                    dark ? '#fff' : '#000'
                  } opacity="1">
                </path>
              </g>
            </svg>
          </NavItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar >
  )
}

// thanks to https://stackoverflow.com/a/42124328/2332101
export default withRouter(Header);

import React from 'react';
import logic from '../../logic'
import { Link } from 'react-router-dom'
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown } from 'reactstrap';
import './styles.css'

export default class navbar extends React.Component {
      state = {
        isOpen: false
      };
    
    toggle=()=> {
      this.setState({
        isOpen: !this.state.isOpen
      });
    }

    render() {
      return (
        <div className='navb'>
          <Navbar color="light" light expand="md">
            <NavbarBrand className='logo-name' href="/">Settle Wise</NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" navbar>
              {(!logic.loggedIn) ? <NavItem>
                  <NavLink className='logo-name' href="#/login">
                <Link to="/login" className="button alt">Log in</Link>                  
                  </NavLink>
                </NavItem> : null}
                {(!logic.loggedIn) ? <NavItem>
                <NavLink className='logo-name' href="#/register">
                <Link to="/register" className="button alt">Register</Link>
                  </NavLink>
                </NavItem> : null }
                <UncontrolledDropdown nav inNavbar>
                </UncontrolledDropdown>
              </Nav>
            </Collapse>
          </Navbar>
        </div>
      );
    }
  }
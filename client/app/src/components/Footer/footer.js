import React from 'react';
import { withRouter } from 'react-router-dom'
import './style.css'

function Footer(props) {

    return (
            <footer id="footer">
                <div className="inner">
                    <h2>Get In Touch</h2>
                    <ul className="actions">
                        <li><span className="icon fa-phone"></span> (+34) 666-666-666</li>
                        <li><span className="icon fa-envelope"></span> ahfortis@hotmail.com</li>
                        <li><span className="icon fa-map-marker"></span> C/ Roc Boronat, Nº35, Barcelona</li>
                    </ul>
                </div>
                <div className="copyright">
                    &copy; Copyright 2018 Abel Hernando Fortis | All Rights Reserved.
				</div>
            </footer>
    )
}

export default withRouter(Footer)
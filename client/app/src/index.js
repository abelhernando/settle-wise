import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { HashRouter } from 'react-router-dom';
import logic from './logic'
import api from 'api'
import 'bootstrap/dist/css/bootstrap.min.css';


logic.userId = sessionStorage.getItem('userId')
api.token = sessionStorage.getItem('token')

ReactDOM.render(
    <HashRouter>
        <App />
    </HashRouter>, document.getElementById('root'));
registerServiceWorker();

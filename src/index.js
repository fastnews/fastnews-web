import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
import './index.css';

// Split location into `/` separated parts, then render `Application` with it
function handleNewHash() {
  var location = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
  var application = <App waiting={!!location[0]} location={location[0]} />;
  ReactDOM.render(application, document.getElementById('root'));
}

// Handle the initial route and browser navigation events
window.addEventListener('hashchange', handleNewHash, false);
handleNewHash()
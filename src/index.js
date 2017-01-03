import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
import './index.css';

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash < 0 ? hash*-1 : hash;
};

// Split location into `/` separated parts, then render `Application` with it
function handleNewHash(e) {
  var location = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
var application = <App waiting={!!location[0]} location={location[0]} />;
  ReactDOM.render(application, document.getElementById('root'));
  return false;
}

// Handle the initial route and browser navigation events
window.addEventListener('hashchange', handleNewHash, false);
handleNewHash()
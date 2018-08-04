import React, { Component } from 'react';
import { Provider } from 'react-redux';
import nacl from 'tweetnacl';
import store from './store';
import WebRTC from './WebRTC';
import QRCode from './QRCode';
import Device from './Device';
import bootstrap from './bootstrap';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

window.nacl = nacl;

class App extends Component {
  componentDidMount() {
    bootstrap();
  }

  render() {
    return (
      <Provider store={store}>
        <div>
          <div className="main-container">
            <Device user="UserA" />
            <Device user="UserB" />
          </div>
          <WebRTC />
        </div>
      </Provider>
    );
  }
}

export default App;

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Monitor from './components/Monitor';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Node.js with some Prometheus</h1>
        </header>
        <div className="App-intro">
          <Monitor />
        </div>
      </div>
    );
  }
}

export default App;

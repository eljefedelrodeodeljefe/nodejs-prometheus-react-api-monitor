import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Monitor from './components/Monitor';
import RequestBox from './components/RequestBox';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Node.js with some Prometheus</h1>
        </header>
        <main className="app-intro">
          <div><RequestBox /></div>
          <div><Monitor /></div>
        </main>
      </div>
    );
  }
}

export default App;

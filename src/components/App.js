import React, { Component } from "react";
import Web3 from "web3";
import Identicon from "identicon.js";
import "./App.css";
import Decentragram from "../abis/Decentragram.json";
import Navbar from "./Navbar";
import Main from "./Main";

class App extends Component {
  async loadWeb3() {
    if (window.etheruem) {
      window.web3 = new Web3(window.etheruem)
      await window.etheruem.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non etheruem browser detected. You should consider trying to install metamask')
    }
  }

  async loadBlockChainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({
      account: accounts[0]
    })
    console.log(accounts[0])
    const networkId = await web3.eth.net.getId()
    const networkData = Decentragram.networks[networkId]
    if (networkData) {
      const decentragram = new web3.eth.Contract(Decentragram.abi, networkData.address)
      console.log(decentragram)
      this.setState({
        decentragram
      })
      this.setState({
        loading: false
      })
      const imagesCount = await decentragram.methods.imageCount().call()
      this.setState({
        imagesCount
      })
      console.log(imagesCount)
    } else {
      window.alert("Contract not deployed to this network")
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      decentragram: null,
      images: [],
      loading: true,
      imagesCount: 0
    };
  }

  componentWillMount() {
    this.loadWeb3()
    this.loadBlockChainData()
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading ? (
          <div id="loader" className="text-center mt-5">
            <p>Loading...</p>
          </div>
        ) : (
          <Main
          // Code...
          />
        )}
      </div>
    );
  }
}

export default App;

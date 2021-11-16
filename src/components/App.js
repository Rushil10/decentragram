import React, { Component } from "react";
import Web3 from "web3";
import Identicon from "identicon.js";
import "./App.css";
import Decentragram from "../abis/Decentragram.json";
import Navbar from "./Navbar";
import Main from "./Main";

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

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
      const imagesCount = await decentragram.methods.imageCount().call()
      this.setState({
        imagesCount
      })
      for (var i = 0; i < imagesCount.length; i++) {
        const image = await decentragram.methods.images(i).call()
        this.setState({
          images: [...this.state.images, image]
        })
      }
      console.log(imagesCount)
      this.setState({
        loading: false
      })
    } else {
      window.alert("Contract not deployed to this network")
    }
  }

  uploadImage = description => {
    console.log("Submitting file to ipfs");
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('ipfs result', result)
      if (error) {
        console.log(error)
        return
      }
      this.setState({
        loading: true
      })
      this.state.decentragram.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({
          loading: false
        })
      })
    })
  }

  captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({
        buffer: Buffer(reader.result)
      })
      console.log('buffer', this.state.buffer)
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      decentragram: null,
      images: [],
      loading: true,
      imagesCount: 0,
      buffer: null
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
            images={this.state.images}
            captureFile={this.captureFile}
            uploadImage={this.uploadImage}
          // Code...
          />
        )}
      </div>
    );
  }
}

export default App;

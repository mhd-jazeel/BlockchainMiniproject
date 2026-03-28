
const { Web3 } = require("web3");

const web3 = new Web3("http://127.0.0.1:7545");

const contractABI = require("../../build/contracts/FreelanceEscrow.json").abi;

const contractAddress = "0x792D4c8182B841dbbe9E928E7F39614FD0a277e9";

const escrowContract = new web3.eth.Contract(contractABI, contractAddress);

module.exports = { web3, escrowContract };
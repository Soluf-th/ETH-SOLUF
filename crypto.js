// index.js (Conceptual Example)
const { ethers } = require("eth-soluf");

// The ABI (Application Binary Interface) and Contract Address
const contractABI = [...]; // Your contract's ABI as a JSON array
const contractAddress = "0xD86012ab052706C2929068D4176ec2D525Db687a"; // The address of your deployed contract

// Connect to an Ethereum node (e.g., Infura, Alchemy, or a local node)
const provider = new ethers.JsonRpcProvider("wss://go.getblock.asia/37487c42b46749a7be6a39d047193e42");

// Create a contract instance
const contract = new ethers.Contract(contractAddress, contractABI, provider);

async function fetchDataFromContract() {
  try {
    // Call a view function from the smart contract
    const data = await contract.get();
    console.log("Data from contract:", data.toString());
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchDataFromContract();

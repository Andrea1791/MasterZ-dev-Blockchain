require("@nomicfoundation/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades"); // Il plugin FONDAMENTALE per noi
require("dotenv").config();
require("@nomicfoundation/hardhat-chai-matchers"); // Per le asserzioni avanzate di Chai

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/a28dc41aed8241dcb61f0ab86421cbee",
      accounts: [process.env.PRIVATE_KEY || "8348e796df5c35e3a80ef902eca2f5baa62351f5105139776f0299041d30769d"],
    },
  },
};
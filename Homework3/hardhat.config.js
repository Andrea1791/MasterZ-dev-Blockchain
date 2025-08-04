require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require('solidity-docgen'); 

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

module.exports = {
  solidity: "0.8.20",
  // ... le tue configurazioni networks ed etherscan ...
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  
  // --- LA CONFIGURAZIONE DOCGEN DEFINITIVA ---
  docgen: {
    // Specifica che l'output deve essere un sito web statico
    pages: 'items',
    // Il percorso dove salvare i file del sito
    outputDir: './docs',
    // Il percorso dei nostri template personalizzati
    templates: './templates',
    // Pulisce la cartella prima di ogni esecuzione
    clear: true,
  },
};
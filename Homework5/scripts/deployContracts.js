// scripts/deployContracts.js

const hre = require("hardhat");

async function main() {
  // 1. Deploy del contratto Token
  console.log("Deploying Token contract...");
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy("MyTestToken", "MTT", 1000000);

  // --- CORREZIONE 1: Usiamo .target per l'indirizzo ---
  console.log("✅ Token contract deployed to:", token.target);

  // 2. Deploy del contratto SimpleDEX
  const oracleAddressSepolia = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
  console.log("\nDeploying SimpleDEX contract...");

  const SimpleDEX = await hre.ethers.getContractFactory("SimpleDEX"); 
  const simpleDex = await SimpleDEX.deploy(token.target, oracleAddressSepolia);

  
  console.log("✅ SimpleDEX contract deployed to:", simpleDex.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
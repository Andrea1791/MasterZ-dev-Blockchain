// File: scripts/deploy-factory.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying NFT implementation (template)...");
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const nftImplementation = await MyNFT.deploy();
  await nftImplementation.waitForDeployment();
  const implementationAddress = await nftImplementation.getAddress();
  console.log("NFT Implementation deployed to:", implementationAddress);

  console.log("\nDeploying NFT Factory...");
  const NFTFactory = await ethers.getContractFactory("NFTFactory");
  // Passiamo l'indirizzo del modello al costruttore della factory
  const factory = await NFTFactory.deploy(implementationAddress);
  await factory.waitForDeployment();
  console.log("NFT Factory deployed to:", await factory.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
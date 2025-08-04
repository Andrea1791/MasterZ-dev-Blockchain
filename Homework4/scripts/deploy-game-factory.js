// File: scripts/deploy-game-factory.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying GameItems implementation (template contract)...");

  // 1. Deploy del contratto modello 'GameItems'
  const GameItems = await ethers.getContractFactory("GameItems");
  const implementation = await GameItems.deploy();
  await implementation.waitForDeployment(); // Aspettiamo che la transazione sia confermata
  const implementationAddress = await implementation.getAddress();
  
  console.log(`✅ GameItems Implementation (template) deployed to: ${implementationAddress}`);

  console.log("\nDeploying GameItemsFactory...");

  // 2. Deploy della factory, passando l'indirizzo del modello nel suo constructor
  const GameItemsFactory = await ethers.getContractFactory("GameItemsFactory");
  const factory = await GameItemsFactory.deploy(implementationAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log(`✅ GameItemsFactory deployed to: ${factoryAddress}`);
  console.log("\nDeployment complete! You can now use the factory to create new game sets.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
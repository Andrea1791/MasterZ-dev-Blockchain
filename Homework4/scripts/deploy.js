// File: scripts/deploy.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  // 1. Prende il nostro "stampo" del contratto
  const NotaryV1 = await ethers.getContractFactory("NotaryV1");
  console.log("Deploying Proxy, ProxyAdmin, and Implementation contract...");

  // 2. Comando magico di OpenZeppelin.
  //    Usa il plugin 'upgrades' per deployare un proxy.
  const notaryProxy = await upgrades.deployProxy(NotaryV1, [], {
    initializer: "initialize",
  });

  // 3. Aspetta che il deploy sia finalizzato
  await notaryProxy.waitForDeployment();

  // 4. Stampa l'indirizzo del PROXY. Questo è l'unico indirizzo che ci interessa.
  console.log("Proxy deployed to:", await notaryProxy.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
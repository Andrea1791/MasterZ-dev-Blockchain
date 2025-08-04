// File: scripts/upgrade.js
const { ethers, upgrades } = require("hardhat");

// !! INSERISCI QUI L'INDIRIZZO DEL PROXY CHE HAI DEPLOYATO !!
const PROXY_ADDRESS = "0x7ef4B7e3dc7578022345E2abd1504Fa5D8D4678f";

async function main() {
  // 1. Prendiamo lo "stampo" del nuovo contratto (V2)
  const NotaryV2 = await ethers.getContractFactory("NotaryV2");
  console.log("Upgrading to V2...");

  // 2. Comando magico per l'aggiornamento.
  //    Dice al proxy all'indirizzo PROXY_ADDRESS di usare il nuovo codice di NotaryV2.
  //    I dati e l'indirizzo del proxy rimangono INVARIATI.
  await upgrades.upgradeProxy(PROXY_ADDRESS, NotaryV2);
  
  console.log("Proxy upgraded successfully to V2");

  // Opzionale: verifichiamo il nuovo indirizzo dell'implementazione
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  console.log("New implementation (logic) contract at:", implementationAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
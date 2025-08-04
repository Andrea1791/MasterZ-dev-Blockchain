// File: scripts/use-factory.js
const { ethers } = require("hardhat");

// === INSERISCI QUI L'INDIRIZZO DELLA TUA FACTORY DEPLOYATA ===
const FACTORY_ADDRESS = "0x8204ceA1E04223c83ca79c9e483c134cd2B52EFe";

async function main() {
  console.log(`Connecting to the NFTFactory at ${FACTORY_ADDRESS}...`);

  // Otteniamo un "oggetto contratto" per interagire con la nostra factory
  const factory = await ethers.getContractAt("NFTFactory", FACTORY_ADDRESS);

  console.log("Calling createNFT() to deploy a new clone...");
  const nftName = "My First Cloned Token";
  const nftSymbol = "CLONE1";

  // Chiamiamo la funzione e aspettiamo che la transazione venga minata
  const tx = await factory.createNFT(nftName, nftSymbol);
  const receipt = await tx.wait(); // 'wait' è fondamentale per avere i risultati

  console.log("Transaction was successful!");
  console.log(`Gas used: ${receipt.gasUsed.toString()}`); // Vedrai quanto poco gas è stato usato!

  // Il modo migliore per ottenere l'indirizzo del clone è leggere gli eventi
  // che la transazione ha emesso. Il nostro evento 'NFTCloned' è perfetto.
  const cloneEvent = receipt.logs.find(log => factory.interface.parseLog(log)?.name === 'NFTCloned');
  if (!cloneEvent) {
    throw new Error("Could not find the NFTCloned event in the transaction logs");
  }

  const cloneAddress = cloneEvent.args.cloneAddress;
  console.log(`\nNew NFT clone deployed at address: ${cloneAddress}`);
  console.log(`Owned by: ${cloneEvent.args.owner}`);

  // Verifichiamo che il clone funzioni!
  console.log("\nVerifying the new clone...");
  const myNewNFT = await ethers.getContractAt("MyNFT", cloneAddress);
  const name = await myNewNFT.name();
  const symbol = await myNewNFT.symbol();
  const owner = await myNewNFT.owner();

  console.log(`Clone Name: ${name}`);
  console.log(`Clone Symbol: ${symbol}`);
  console.log(`Clone Owner: ${owner}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
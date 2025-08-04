// File: scripts/use-game-factory.js
const { ethers } = require("hardhat");
const { expect } = require("chai"); // Importiamo 'expect' per fare delle verifiche

// === INCOLLA QUI L'INDIRIZZO DELLA TUA FACTORY ===
const FACTORY_ADDRESS = "0x7D8BB49e65c3bC82B206943f34621e5A38434c48";

// Questo è il CID che l'utente vuole usare per i metadati dei suoi oggetti.
// Usiamo quello del tuo progetto originale.
const IPFS_URI = "ipfs://bafybeihnouxypk3ufwdshvb4ej4mdvfcg3dg6qywygwdgpl6g2yishlmki/{id}.json";

async function main() {
  // Otteniamo il nostro account per firmare la transazione
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  console.log(`\nConnecting to GameItemsFactory at ${FACTORY_ADDRESS}...`);
  const factory = await ethers.getContractAt("GameItemsFactory", FACTORY_ADDRESS);

  console.log(`Calling createGameSet() to deploy a new clone with URI: ${IPFS_URI}`);
  
  // Chiamiamo la funzione per creare il clone e aspettiamo che la transazione venga minata
  const tx = await factory.createGameSet(IPFS_URI);
  const receipt = await tx.wait();
  console.log("✅ Transaction successful! Clone created.");

  // Recuperiamo l'indirizzo del clone dall'evento emesso dalla factory
  const cloneEvent = receipt.logs.find(log => {
      try {
          return factory.interface.parseLog(log)?.name === 'GameSetCloned';
      } catch {
          return false;
      }
  });

  if (!cloneEvent) {
    throw new Error("Could not find the GameSetCloned event in the transaction logs");
  }

  const cloneAddress = cloneEvent.args.cloneAddress;
  console.log(`\nClone deployed at address: ${cloneAddress}`);

  // --- VERIFICA ON-CHAIN ---
  console.log("\nVerifying the new clone's state directly from the blockchain...");
  const gameSet = await ethers.getContractAt("GameItems", cloneAddress);
  
  const owner = await gameSet.owner();
  console.log(`- Verifying Owner...`);
  expect(owner).to.equal(signer.address);
  console.log(`  OK! Owner is ${owner}`);
  
  const uri = await gameSet.uri(0); // L'ID non importa, l'URI base è lo stesso
  console.log(`- Verifying URI...`);
  expect(uri).to.equal(IPFS_URI);
  console.log(`  OK! URI is set to: ${uri}`);
  
  const goldBalance = await gameSet.balanceOf(signer.address, 0); // ID 0 = GOLD_COIN
  console.log(`- Verifying initial GOLD_COIN balance...`);
  expect(goldBalance).to.equal(1000);
  console.log(`  OK! Initial balance is ${goldBalance}`);

  console.log("\nCongratulations! You have successfully used your factory to create and verify a new game set.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
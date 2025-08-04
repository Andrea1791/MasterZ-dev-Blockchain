const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

// Raggruppiamo tutti i test relativi al contratto Notary e al suo ciclo di vita di aggiornamento.
describe("Notary (Upgradeable)", function () {
  let notaryV1;
  let owner, addr1;

  // Questo blocco viene eseguito prima di ogni singolo test 'it(...)'.
  // Garantisce che ogni test parta da una situazione pulita con un contratto appena deployato.
  beforeEach(async function () {
    // Otteniamo i firmatari (account di test) che Hardhat ci fornisce.
    [owner, addr1] = await ethers.getSigners();

    // Otteniamo lo "stampo" del nostro contratto V1.
    const NotaryV1 = await ethers.getContractFactory("NotaryV1");

    // Usiamo il plugin 'upgrades' per deployare il proxy.
    // 'deployProxy' deploya l'implementazione V1, il ProxyAdmin e il Proxy, e li collega.
    notaryV1 = await upgrades.deployProxy(NotaryV1, [], {
      initializer: "initialize",
      kind: 'uups' // 'uups' è lo standard per i proxy aggiornabili.
    });
    await notaryV1.waitForDeployment();
  });

  // Suite di test per la versione V1
  describe("Version 1 Logic", function () {
    it("Should set the deployer as the owner upon initialization", async function () {
      // Verifichiamo che la funzione 'initialize' abbia impostato l'owner correttamente.
      expect(await notaryV1.owner()).to.equal(owner.address);
    });

    it("Should allow any address to add a new document", async function () {
      const docHash = ethers.keccak256(ethers.toUtf8Bytes("Test Document 1"));
      
      // L'utente 'addr1' chiama la funzione per aggiungere un documento.
      await notaryV1.connect(addr1).addDocument(docHash);
      
      // Verifichiamo che il proprietario del documento sia stato registrato correttamente.
      expect(await notaryV1.getDocumentOwner(docHash)).to.equal(addr1.address);
    });

    it("Should revert if trying to add an existing document hash", async function () {
      const docHash = ethers.keccak256(ethers.toUtf8Bytes("Duplicate Document"));
      await notaryV1.addDocument(docHash);

      // Verifichiamo che un secondo tentativo con lo stesso hash fallisca
      // con il messaggio di errore che ci aspettiamo.
      await expect(
        notaryV1.addDocument(docHash)
      ).to.be.revertedWith("Document already exists");
    });

    it("Should return a zero address for a non-existent document", async function () {
      const nonExistentHash = ethers.keccak256(ethers.toUtf8Bytes("I Do Not Exist"));
      // Ci aspettiamo che il risultato per un documento non registrato sia l'indirizzo nullo.
      expect(await notaryV1.getDocumentOwner(nonExistentHash)).to.equal(ethers.ZeroAddress);
    });
  });

  // Suite di test specifica per il processo di aggiornamento.
  describe("Upgrade to V2", function () {
    it("Should upgrade to V2 and preserve the state of V1", async function () {
      // 1. Impostiamo uno stato nella V1.
      const docHash = ethers.keccak256(ethers.toUtf8Bytes("A Persistent Document"));
      await notaryV1.connect(addr1).addDocument(docHash);
      
      // 2. Prepariamo ed eseguiamo l'aggiornamento.
      const NotaryV2 = await ethers.getContractFactory("NotaryV2");
      const notaryV2 = await upgrades.upgradeProxy(await notaryV1.getAddress(), NotaryV2);
      await notaryV2.waitForDeployment();

      // 3. Verifichiamo che lo stato sia ancora presente e corretto nel contratto V2.
      // Questa è la prova che lo storage del proxy non è stato perso.
      expect(await notaryV2.getDocumentOwner(docHash)).to.equal(addr1.address);
      expect(await notaryV2.owner()).to.equal(owner.address);
    });

    it("Should allow the owner to use the new renameDocument function from V2", async function () {
      const NotaryV2 = await ethers.getContractFactory("NotaryV2");
      const notaryV2 = await upgrades.upgradeProxy(await notaryV1.getAddress(), NotaryV2);
      await notaryV2.waitForDeployment();

      const oldHash = ethers.keccak256(ethers.toUtf8Bytes("Old Name"));
      const newHash = ethers.keccak256(ethers.toUtf8Bytes("New Name"));
      
      await notaryV2.connect(addr1).addDocument(oldHash);
      
      // Il proprietario del contratto ('owner') chiama la nuova funzione.
      await notaryV2.connect(owner).renameDocument(oldHash, newHash);
      
      // Verifichiamo che il documento sia stato rinominato.
      expect(await notaryV2.getDocumentOwner(oldHash)).to.equal(ethers.ZeroAddress); // Il vecchio hash non esiste più.
      expect(await notaryV2.getDocumentOwner(newHash)).to.equal(addr1.address);
    });

    it("Should revert if a non-owner tries to use the renameDocument function", async function () {
      const NotaryV2 = await ethers.getContractFactory("NotaryV2");
      const notaryV2 = await upgrades.upgradeProxy(await notaryV1.getAddress(), NotaryV2);
      await notaryV2.waitForDeployment();
      
      const oldHash = ethers.keccak256(ethers.toUtf8Bytes("Another Doc"));
      await notaryV2.connect(addr1).addDocument(oldHash);
      
      // Verifichiamo che 'addr1' (non proprietario del contratto) non possa chiamare la funzione.
      await expect(
        notaryV2.connect(addr1).renameDocument(oldHash, ethers.keccak256(ethers.toUtf8Bytes("Attempt")))
      ).to.be.revertedWith("Only owner can rename");
    });
  });
});
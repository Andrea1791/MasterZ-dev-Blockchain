const { expect } = require("chai");
const { ethers } = require("hardhat");

// Raggruppiamo i test per la NFTFactory.
describe("NFTFactory", function () {
  let nftImplementation, factory;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // 1. Deployiamo il contratto "modello" una sola volta.
    const MyNFT = await ethers.getContractFactory("MyNFT");
    nftImplementation = await MyNFT.deploy();
    await nftImplementation.waitForDeployment();

    // 2. Deployiamo la factory, passandole l'indirizzo del modello.
    const NFTFactory = await ethers.getContractFactory("NFTFactory");
    factory = await NFTFactory.deploy(await nftImplementation.getAddress());
    await factory.waitForDeployment();
  });

  // Suite di test per la configurazione e la logica della factory stessa.
  describe("Factory Logic", function () {
    it("Should store the correct implementation address", async function () {
      expect(await factory.implementation()).to.equal(await nftImplementation.getAddress());
    });

    it("Should create a new NFT clone and emit the NFTCloned event", async function () {
      const nftName = "Test Event Token";
      const nftSymbol = "TET";

      // Verifichiamo che la chiamata a 'createNFT' emetta l'evento che ci aspettiamo.
      // È un modo potente per testare che il contratto comunichi correttamente i suoi cambiamenti di stato.
      await expect(factory.connect(addr1).createNFT(nftName, nftSymbol))
        .to.emit(factory, "NFTCloned")
        .withArgs(
          (cloneAddress) => ethers.isAddress(cloneAddress), // Non possiamo predire l'indirizzo, ma verifichiamo che sia valido.
          addr1.address, 
          nftName, 
          nftSymbol
        );
    });

    it("Should create multiple, independent clones", async function () {
      // Creiamo il Clone 1, di proprietà di 'owner'.
      const tx1 = await factory.connect(owner).createNFT("Clone One", "C1");
      const r1 = await tx1.wait();
      const e1 = r1.logs.find(log => factory.interface.parseLog(log)?.name === 'NFTCloned');
      const addrClone1 = e1.args.cloneAddress;
      const clone1 = await ethers.getContractAt("MyNFT", addrClone1);
    
      // Creiamo il Clone 2, di proprietà di 'addr1'.
      const tx2 = await factory.connect(addr1).createNFT("Clone Two", "C2");
      const r2 = await tx2.wait();
      const e2 = r2.logs.find(log => factory.interface.parseLog(log)?.name === 'NFTCloned');
      const addrClone2 = e2.args.cloneAddress;
      const clone2 = await ethers.getContractAt("MyNFT", addrClone2);
    
      // Verifichiamo che i cloni abbiano indirizzi diversi.
      expect(addrClone1).to.not.equal(addrClone2);
      
      // Verifichiamo che ogni clone abbia il suo proprietario corretto e indipendente.
      expect(await clone1.owner()).to.equal(owner.address);
      expect(await clone2.owner()).to.equal(addr1.address);
    });
  });

  // Suite di test specifica per verificare la funzionalità DEI CLONI creati.
  describe("Cloned NFT Functionality", function () {
    let clonedNFT;
    let ownerOfClone;

    beforeEach(async function () {
      // Prima di ogni test in questa suite, creiamo un nuovo clone.
      ownerOfClone = addr1;
      const tx = await factory.connect(ownerOfClone).createNFT("My Test Clone", "MTC");
      const receipt = await tx.wait();
      const cloneEvent = receipt.logs.find(log => factory.interface.parseLog(log)?.name === 'NFTCloned');
      const cloneAddress = cloneEvent.args.cloneAddress;
      // Ci colleghiamo al clone per poterlo testare.
      clonedNFT = await ethers.getContractAt("MyNFT", cloneAddress);
    });

    it("Should have its data initialized correctly", async function () {
      expect(await clonedNFT.name()).to.equal("My Test Clone");
      expect(await clonedNFT.symbol()).to.equal("MTC");
      expect(await clonedNFT.owner()).to.equal(ownerOfClone.address);
    });

    it("Should allow the clone's owner to mint a new token", async function () {
      // Il proprietario del clone ('addr1') può mintare.
      await expect(clonedNFT.connect(ownerOfClone).safeMint(ownerOfClone.address))
        .to.emit(clonedNFT, "Transfer"); // Verifichiamo che l'evento standard ERC721 venga emesso.
        
      expect(await clonedNFT.balanceOf(ownerOfClone.address)).to.equal(1);
      expect(await clonedNFT.ownerOf(0)).to.equal(ownerOfClone.address);
    });

    it("Should NOT allow a different address to mint a new token", async function () {
      // 'owner' non è il proprietario di questo clone.
      // Verifichiamo che il tentativo fallisca con l'errore custom di OpenZeppelin.
      await expect(
        clonedNFT.connect(owner).safeMint(owner.address)
      ).to.be.revertedWithCustomError(clonedNFT, "OwnableUnauthorizedAccount").withArgs(owner.address);
    });
  });
});
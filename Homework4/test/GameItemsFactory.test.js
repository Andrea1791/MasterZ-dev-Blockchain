// File: test/GameItemsFactory.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameItemsFactory", function () {
  let gameItemsImplementation, factory;
  let owner, addr1;

  // URI di esempio per i test
  const TEST_URI = "ipfs://test-uri/{id}.json";

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // 1. Deploy del modello GameItems
    const GameItems = await ethers.getContractFactory("GameItems");
    gameItemsImplementation = await GameItems.deploy();
    await gameItemsImplementation.waitForDeployment();

    // 2. Deploy della factory
    const GameItemsFactory = await ethers.getContractFactory("GameItemsFactory");
    factory = await GameItemsFactory.deploy(await gameItemsImplementation.getAddress());
    await factory.waitForDeployment();
  });

  describe("Factory Deployment", function () {
    it("Should store the correct implementation address", async function () {
      expect(await factory.implementation()).to.equal(await gameItemsImplementation.getAddress());
    });
  });

  describe("Game Set Creation", function () {
    it("Should create a new GameSet clone and emit the event", async function () {
      // Verifichiamo che la transazione emetta l'evento corretto con i giusti parametri
      await expect(factory.connect(addr1).createGameSet(TEST_URI))
        .to.emit(factory, "GameSetCloned")
        .withArgs(
          (cloneAddress) => ethers.isAddress(cloneAddress),
          addr1.address,
          TEST_URI
        );
    });

    it("Should create a clone that is correctly initialized", async function () {
      // Creiamo il clone
      const tx = await factory.connect(addr1).createGameSet(TEST_URI);
      const receipt = await tx.wait();
      const cloneEvent = receipt.logs.find(log => { try { return factory.interface.parseLog(log)?.name === 'GameSetCloned' } catch { return false } });
      const cloneAddress = cloneEvent.args.cloneAddress;

      // Ci colleghiamo al clone per testarlo
      const gameSet = await ethers.getContractAt("GameItems", cloneAddress);

      // Verifichiamo che i dati siano stati inizializzati correttamente
      expect(await gameSet.owner()).to.equal(addr1.address);
      expect(await gameSet.uri(0)).to.equal(TEST_URI); // L'ID non importa per l'URI base
    });

    it("Should mint the initial set of items to the clone's owner", async function () {
      // Creiamo il clone
      const tx = await factory.connect(addr1).createGameSet(TEST_URI);
      const receipt = await tx.wait();
      const cloneEvent = receipt.logs.find(log => { try { return factory.interface.parseLog(log)?.name === 'GameSetCloned' } catch { return false } });
      const cloneAddress = cloneEvent.args.cloneAddress;
      const gameSet = await ethers.getContractAt("GameItems", cloneAddress);

      // Questo è il test chiave per ERC1155: verifichiamo i saldi iniziali!
      const goldId = await gameSet.GOLD_COIN();
      const swordId = await gameSet.LEGENDARY_SWORD();

      expect(await gameSet.balanceOf(addr1.address, goldId)).to.equal(1000);
      expect(await gameSet.balanceOf(addr1.address, swordId)).to.equal(1);
    });
  });

  describe("Cloned GameSet Permissions", function () {
    it("Should allow the clone's owner to mint more items", async function () {
      // Creiamo un clone di cui 'owner' è il proprietario
      const tx = await factory.connect(owner).createGameSet(TEST_URI);
      const receipt = await tx.wait();
      const cloneEvent = receipt.logs.find(log => { try { return factory.interface.parseLog(log)?.name === 'GameSetCloned' } catch { return false } });
      const cloneAddress = cloneEvent.args.cloneAddress;
      const gameSet = await ethers.getContractAt("GameItems", cloneAddress);
      
      const goldId = await gameSet.GOLD_COIN();
      // Il proprietario ('owner') minta altre 500 monete per 'addr1'
      await expect(gameSet.connect(owner).mint(addr1.address, goldId, 500, "0x"))
        .to.emit(gameSet, "TransferSingle");
      
      expect(await gameSet.balanceOf(addr1.address, goldId)).to.equal(500);
    });

    it("Should NOT allow another address to mint items", async function () {
      // Creiamo un clone di cui 'owner' è il proprietario
      const tx = await factory.connect(owner).createGameSet(TEST_URI);
      const receipt = await tx.wait();
      const cloneEvent = receipt.logs.find(log => { try { return factory.interface.parseLog(log)?.name === 'GameSetCloned' } catch { return false } });
      const cloneAddress = cloneEvent.args.cloneAddress;
      const gameSet = await ethers.getContractAt("GameItems", cloneAddress);

      const goldId = await gameSet.GOLD_COIN();
      // 'addr1' prova a mintare, ma non è il proprietario del clone. Deve fallire.
      await expect(
        gameSet.connect(addr1).mint(addr1.address, goldId, 500, "0x")
      ).to.be.revertedWithCustomError(gameSet, "OwnableUnauthorizedAccount").withArgs(addr1.address);
    });
  });
});
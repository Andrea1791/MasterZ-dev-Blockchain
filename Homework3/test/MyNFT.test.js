const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  // Definiamo le variabili qui, così sono accessibili a tutti i test
  let myNFT;
  let owner, addr1, addr2;

  // ID dei token per leggibilità
  const GOLD_COIN = 0;
  const LEGENDARY_SWORD = 1;
  const VALOROUS_SWORD = 2;
  const HERO_SWORD = 3;
  const COMMON_SWORD = 4;

  // Sostituisci questo con il CID reale del tuo contratto!
  const BASE_URI = "ipfs://bafybeihkxvrrxsy2ucks7jodecifcunz5e4w4awihkonpbkzxz5hwo6ynu/{id}.json"; 

  // Questo blocco viene eseguito PRIMA di ogni test 'it'
  beforeEach(async function () {
    const MyNFT = await ethers.getContractFactory("MyNFT");
    // Otteniamo gli account e li assegnamo alle nostre variabili
    [owner, addr1, addr2] = await ethers.getSigners();
    // Deployamo il contratto
    myNFT = await MyNFT.deploy();
  });

  // --- Iniziano i test ---

  it("Should mint initial supply to the owner", async function () {
    expect(await myNFT.balanceOf(owner.address, GOLD_COIN)).to.equal(1000);
    expect(await myNFT.balanceOf(owner.address, LEGENDARY_SWORD)).to.equal(1);
    expect(await myNFT.balanceOf(owner.address, VALOROUS_SWORD)).to.equal(1);
    expect(await myNFT.balanceOf(owner.address, HERO_SWORD)).to.equal(1);
    expect(await myNFT.balanceOf(owner.address, COMMON_SWORD)).to.equal(1);
  });

  it("Should allow transfers of fungible tokens", async function () {
    await myNFT.connect(owner).safeTransferFrom(owner.address, addr1.address, GOLD_COIN, 100, "0x");
    expect(await myNFT.balanceOf(addr1.address, GOLD_COIN)).to.equal(100);
  });
  
  it("Should fail if a non-owner tries to mint", async function () {
    await expect(
      myNFT.connect(addr1).mint(addr1.address, GOLD_COIN, 100, "0x")
    ).to.be.revertedWithCustomError(myNFT, "OwnableUnauthorizedAccount");
  });

  it("Should allow the owner to mint new tokens", async function () {
    await myNFT.connect(owner).mint(addr1.address, GOLD_COIN, 500, "0x");
    expect(await myNFT.balanceOf(addr1.address, GOLD_COIN)).to.equal(500);
  });

  it("Should allow transfers of a non-fungible token (NFT)", async function () {
    await myNFT.connect(owner).safeTransferFrom(owner.address, addr1.address, LEGENDARY_SWORD, 1, "0x");
    expect(await myNFT.balanceOf(addr1.address, LEGENDARY_SWORD)).to.equal(1);
    expect(await myNFT.balanceOf(owner.address, LEGENDARY_SWORD)).to.equal(0);
  });

  it("Should fail if trying to transfer more tokens than owned", async function () {
    await expect(
      myNFT.connect(addr1).safeTransferFrom(addr1.address, owner.address, LEGENDARY_SWORD, 1, "0x")
    ).to.be.revertedWithCustomError(myNFT, "ERC1155InsufficientBalance");
  });

  it("Should return the correct URI for a token ID", async function () {
    const tokenURI = await myNFT.uri(LEGENDARY_SWORD);
    // Assicurati che BASE_URI in cima al file sia corretto!
    expect(tokenURI).to.equal(BASE_URI);
  });

  it("Should allow batch transfers", async function () {
    await myNFT.connect(owner).safeBatchTransferFrom(
      owner.address,
      addr1.address,
      [GOLD_COIN, COMMON_SWORD],
      [50, 1],
      "0x"
    );
    expect(await myNFT.balanceOf(addr1.address, GOLD_COIN)).to.equal(50);
    expect(await myNFT.balanceOf(addr1.address, COMMON_SWORD)).to.equal(1);
  });

  it("Should fail batch transfer if arrays length mismatch", async function () {
    await expect(
      myNFT.connect(owner).safeBatchTransferFrom(
        owner.address,
        addr1.address,
        [GOLD_COIN, COMMON_SWORD], // 2 IDs
        [50],                      // 1 amount
        "0x"
      )
    ).to.be.revertedWithCustomError(myNFT, "ERC1155InvalidArrayLength");
  });

  it("Should allow a user to trade an NFT to another user", async function () {
    await myNFT.connect(owner).safeTransferFrom(owner.address, addr1.address, LEGENDARY_SWORD, 1, "0x");
    await myNFT.connect(addr1).safeTransferFrom(addr1.address, addr2.address, LEGENDARY_SWORD, 1, "0x");
    expect(await myNFT.balanceOf(addr2.address, LEGENDARY_SWORD)).to.equal(1);
    expect(await myNFT.balanceOf(addr1.address, LEGENDARY_SWORD)).to.equal(0);
  });

  it("Should allow the owner to mint and distribute a batch of common items", async function () {
    const amountToMint = 10;
    await myNFT.connect(owner).mint(owner.address, COMMON_SWORD, amountToMint, "0x");
    expect(await myNFT.balanceOf(owner.address, COMMON_SWORD)).to.equal(11);
    await myNFT.connect(owner).safeTransferFrom(owner.address, addr1.address, COMMON_SWORD, 5, "0x");
    await myNFT.connect(owner).safeTransferFrom(owner.address, addr2.address, COMMON_SWORD, 3, "0x");
    expect(await myNFT.balanceOf(addr1.address, COMMON_SWORD)).to.equal(5);
    expect(await myNFT.balanceOf(addr2.address, COMMON_SWORD)).to.equal(3);
    expect(await myNFT.balanceOf(owner.address, COMMON_SWORD)).to.equal(3);
  });
});
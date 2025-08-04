const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MyNFTModule", (m) => {
  // Dice a Ignition di deployare il contratto chiamato "MyNFT"
  // (il nome deve corrispondere a quello nel file .sol)
  const myNFT = m.contract("MyNFT");

  return { myNFT };
});
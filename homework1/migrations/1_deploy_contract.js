const Token = artifacts.require("Token");
const Blacklist = artifacts.require("Blacklist"); // il contratto vero, non l'interfaccia

module.exports = async (deployer) => {
    await deployer.deploy(Blacklist);
    const blacklist = await Blacklist.deployed();

    await deployer.deploy(Token, "Token Name", "TKN", blacklist.address);
    const token = await Token.deployed();

    console.log("Blacklist deployed at:", blacklist.address);
    console.log("Token deployed at:", token.address);
};

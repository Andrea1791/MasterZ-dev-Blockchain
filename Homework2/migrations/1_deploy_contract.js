const Wallet = artifacts.require("Wallet");
const Token = artifacts.require("Token");
const PriceConsumerV3 = artifacts.require('PriceConsumerV3');

const ethUsdContract = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
const azukiPriceContract = "0xA8B9A447C73191744D5B79BcE864F343455E1150"; // "azuki": Unknown word.

module.exports = async(deployer, network, accounts) => {
    await deployer.deploy(Wallet, ethUsdContract, azukiPriceContract); // "azuki": Unknown word.
    const wallet = await Wallet.deployed();
    console.log("Deployed wallet is @: ", wallet.address);

    await deployer.deploy(Token, "Test token", "TT1", 1000000);
    const token = await Token.deployed();
    console.log("Deployed token is @: ", token.address);

    await deployer.deploy(PriceConsumerV3, ethUsdContract);
    const ethUsdPrice = await PriceConsumerV3.deployed();
    console.log("Deployed Price ETH/USD Mockup is @: ", ethUsdPrice.address);

   // await deployer.deploy(PriceConsumerV3, azukiPriceContract);
    //const azukiUsdPrice = await PriceConsumerV3.deployed();
    //console.log("Deployed Price Azuki/USD Mockup is @: ", azukiUsdPrice.address);
};
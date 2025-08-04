const Wallet = artifacts.require("Wallet");
const Token = artifacts.require("Token");
const PriceConsumerV3 = artifacts.require('PriceConsumerV3');

// Oracle addresses for different networks
const ORACLE_ADDRESSES = {
    // Mainnet
    1: {
        ethUsd: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        azukiEth: "0xA8B9A447C73191744D5B79BcE864F343455E1150"
    },
    // Sepolia
    11155111: {
        ethUsd: "0x694AA1769357215DE4FAC081bf1f309aDC325306", // ETH/USD on Sepolia
        btcUsd: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43"  // BTC/USD on Sepolia (using as token example)
    },
    // Goerli (deprecated but kept for compatibility)
    5: {
        ethUsd: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        btcUsd: "0xA39434A63A52E749F02807ae27335515BA4b07F7"
    },
    // Local development - use placeholder addresses
    "*": {
        ethUsd: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        azukiEth: "0xA8B9A447C73191744D5B79BcE864F343455E1150"
    }
};

module.exports = async(deployer, network, accounts) => {
    const networkId = await web3.eth.net.getId();
    console.log(`Deploying to network: ${network}, Network ID: ${networkId}`);
    
    // Get oracle addresses for the current network
    const oracles = ORACLE_ADDRESSES[networkId] || ORACLE_ADDRESSES["*"];
    const ethUsdContract = oracles.ethUsd;
    const tokenEthContract = oracles.btcUsd || oracles.azukiEth;
    
    console.log(`Using ETH/USD oracle: ${ethUsdContract}`);
    console.log(`Using Token/ETH oracle: ${tokenEthContract}`);

    await deployer.deploy(Wallet, ethUsdContract, tokenEthContract);
    const wallet = await Wallet.deployed();
    console.log("Deployed wallet is @: ", wallet.address);

    await deployer.deploy(Token, "Test token", "TT1", 1000000);
    const token = await Token.deployed();
    console.log("Deployed token is @: ", token.address);

    await deployer.deploy(PriceConsumerV3, ethUsdContract);
    const ethUsdPrice = await PriceConsumerV3.deployed();
    console.log("Deployed Price ETH/USD Consumer is @: ", ethUsdPrice.address);
};
const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const Token = artifacts.require('Token');
const Wallet = artifacts.require('Wallet');
const PriceConsumerV3 = artifacts.require('PriceConsumerV3');
const AggregatorV3Interface = artifacts.require('AggregatorV3Interface');

/**
 * Network: mainnet
 * Aggregator: ETH/USD
 * Address: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
 * Azuki: 0xA8B9A447C73191744D5B79BcE864F343455E1150    "Azuki": Unknown word.
 */
const ethUsdContract = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
const azukiPriceContract = "0xA8B9A447C73191744D5B79BcE864F343455E1150"; // "Azuki": Unknown word.

const fromWei = (x) => web3.utils.fromWei(x.toString());
const toWei = (x) => web3.utils.toWei(x.toString());
const fromWei18Dec = (x) => Number(x) / Math.pow(10, 8);
const toWei8Dec = (x) => Number(x) * Math.pow(10, 8);
const fromWei2Dec = (x) => Number(x) / Math.pow(10, 2);
const toWei2Dec = (x) => Number(x) * Math.pow(10, 2);

contract('Wallet', function (accounts) {
    const [ deployer, firstAccount, secondAccount, fakeOwner ] = accounts;

    it('retrieve deployed contracts', async function () {
        tokenContract = await Token.deployed();
        expect(tokenContract.address).to.be.not.equal(ZERO_ADDRESS);
        expect(tokenContract.address).to.match(/0x[0-9a-fA-F]{40}/);

        walletContract = await Wallet.deployed();

        priceEthUsd = await PriceConsumerV3.deployed();
    });

    it('distribute some tokens from deployer', async function () {
    await tokenContract.transfer(firstAccount, toWei(100000))
    await tokenContract.transfer(secondAccount, toWei(150000))

    balDepl = await tokenContract.balanceOf(deployer)
    balFA = await tokenContract.balanceOf(firstAccount)
    balSA = await tokenContract.balanceOf(secondAccount)

    console.log(fromWei(balDepl), fromWei(balFA), fromWei(balSA))
})
it("Eth / Usd price", async function () {
    let ret = await priceEthUsd.getPriceDecimals();
    console.log(ret.toString());
    let res = await priceEthUsd.getLatestPrice();
    console.log(fromWei8Dec(res));
});

it("Azuki / Eth price", async function () {
    const azukiUsdData = await AggregatorV3Interface.at(azukiPriceContract);
    let ret = await azukiUsdData.decimals();
    console.log(ret.toString());
    let res = await azukiUsdData.latestRoundData();
    console.log(fromWei(res[1]));

    console.log(fromWei(await walletContract.getNFTPrice()));
});

it("convert ETH in USD", async function () {
    await walletContract.sendTransaction({ from: firstAccount, value: toWei(2) });
    let ret = await walletContract.convertEthInUSD(firstAccount);
    console.log(fromWei2Dec(ret));

    ret = await walletContract.convertUSDInETH(toWei2Dec(5000));
    console.log(fromWei(ret));

    ret = await walletContract.convertNFTPriceInUSD();
    console.log(fromWei2Dec(ret));

    ret = await walletContract.convertUSDInNFTAmount(toWei2Dec(25000));
    console.log(ret[0].toString(), fromWei2Dec(ret[1]));

    ret = await walletContract.convertUSDInNFTAmount(toWei2Dec(48000));
    console.log(ret[0].toString(), fromWei2Dec(ret[1]));
})

it("user buys 1 NFT", async function () {
    await tokenContract.approve(walletContract.address, toWei(25000), {from: firstAccount});
    await walletContract.userDeposit(tokenContract.address, toWei(25000), {from: firstAccount});

    res = await walletContract.userTokenDeposit(firstAccount, tokenContract.address);
    console.log(fromWei(res));

    res = await tokenContract.balanceOf(tokenContract.address);
    console.log(fromWei(res));
});

it ("user buy 2 NFT", async function () {
    await tokenContract.approve(walletContract.address, toWei(48000), { from: secondAccount });
    await walletContract.userDeposit(tokenContract.address, toWei(48000), { from: secondAccount });

    let balFA = await tokenContract.balanceOf(firstAccount);
    let balSA = await tokenContract.balanceOf(secondAccount);

    console.log(fromWei(balFA), fromWei(balSA));
})
it("user deposit some tokens", async function () {
    await tokenContract.approve(walletContract.address, toWei(25000), {from: firstAccount})
    await walletContract.userDeposit(tokenContract.address, toWei(25000), {from: firstAccount})
    res = await walletContract.getUserDeposit(firstAccount, tokenContract.address)
    console.log(fromWei(res))
    res = await tokenContract.balanceOf(walletContract.address)
    console.log(fromWei(res))
})

it("user deposit some tokens", async function () {
    await walletContract.userTokenWithdraw(tokenContract.address, {from: firstAccount})
    res = await walletContract.getUserDeposit(firstAccount, tokenContract.address)
    console.log(fromWei(res))
    res = await tokenContract.balanceOf(walletContract.address)
    console.log(fromWei(res))
})

});
const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const Collector = artifacts.require('Collector');

const fromWei = (x) => web3.utils.fromWei(x.toString());
const toWei = (x) => web3.utils.toWei(x.toString());
const fromWei18Dec = (x) => x / Math.pow(10, 8);
const toWei18Dec = (x) => x * Math.pow(10, 8);
const fromWei12Dec = (x) => x / Math.pow(10, 2);
const toWei12Dec = (x) => x * Math.pow(10, 2);


contract('Collector test', function (accounts) {
    const [ deployer, firstAccount, secondAccount, fakeOwner ] = accounts;

    it('retrieve deployed contracts', async function () {
        collectorContract = await Collector.deployed();
        expect(collectorContract.address).to.be.not.equal(ZERO_ADDRESS);
        expect(collectorContract.address).to.match(/0x[0-9a-fA-F]{40}/);

        console.log(await collectorContract.oracleEthUsdPrice());
    });

    it('get price feed', async function () {
        console.log("1 ETH = " + fromWei18Dec(await collectorContract.getLatestPrice()) + " USD");
    });

    it('send some eth and get user deposit in dollars', async function () {
        await collectorContract.sendTransaction({from: firstAccount, value: toWei(1)});
        console.log(fromWei(await collectorContract.userEthDeposits(firstAccount)) + " ETH");
    });
        it('send some eth and get user deposit in dollars', async function () {
        await collectorContract.sendTransaction({from: firstAccount, value: toWei(1)})
        console.log(fromWei(await collectorContract.userEthDeposits(firstAccount)) + " ETH")
        console.log(fromWei12Dec(await collectorContract.convertEthInUSD(firstAccount)) + " USD")
    })
        it('get smart contract balance in ETH', async function () {
        console.log(fromWei(await collectorContract.getNativeCoinsBalance()) + " ETH")
    })

    it('withdraw first account', async function () {
        await collectorContract.userETHWithdraw({from: firstAccount})
        console.log(fromWei(await collectorContract.getNativeCoinsBalance()) + " ETH")
    })

    it('withdraw second account', async function () {
        await collectorContract.userETHWithdraw({from: secondAccount})
        console.log(fromWei(await collectorContract.getNativeCoinsBalance()) + " ETH")
    })

    it('withdraw second account again', async function () {
        await collectorContract.userETHWithdraw({from: secondAccount})
        console.log(fromWei(await collectorContract.getNativeCoinsBalance()) + " ETH")
    });
});



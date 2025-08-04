const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (value) => ethers.parseEther(value.toString());
const fromWei = (value) => ethers.formatEther(value.toString());

describe("SimpleDEX: Comprehensive Test Suite", function () {
    
    let Token, token, SimpleDEX, simpleDEX, MockOracle, mockOracle;
    let owner, user1;

    const ORACLE_DECIMALS = 8;
    const MOCK_PRICE = 3000 * 10 ** ORACLE_DECIMALS;

    before(async function () {
        [owner, user1] = await ethers.getSigners();
        Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Test Token", "TTK", toWei("1000000"));
        MockOracle = await ethers.getContractFactory("MockV3Aggregator");
        mockOracle = await MockOracle.deploy(ORACLE_DECIMALS, MOCK_PRICE);
        SimpleDEX = await ethers.getContractFactory("SimpleDEX");
        simpleDEX = await SimpleDEX.deploy(await token.getAddress(), await mockOracle.getAddress());
        
        await token.transfer(await simpleDEX.getAddress(), toWei(50000));
        await owner.sendTransaction({ to: await simpleDEX.getAddress(), value: toWei(20) });
    });

    it("Should correctly handle the full value exchange for a BUY operation", async function() {
        const ethToSpend = toWei(1);
        const expectedTokensToReceive = toWei(3000);

        console.log("\n--- VERIFICA SCAMBIO: Comprare Token ---");
        const userEthBalance_before = await ethers.provider.getBalance(user1.address);
        const userTokenBalance_before = await token.balanceOf(user1.address);
        const dexEthBalance_before = await ethers.provider.getBalance(await simpleDEX.getAddress());
        const dexTokenBalance_before = await token.balanceOf(await simpleDEX.getAddress());
        console.log(`      - UTENTE (prima): ${fromWei(userTokenBalance_before)} TTK, ${parseFloat(fromWei(userEthBalance_before)).toFixed(4)} ETH`);
        console.log(`      - DEX (prima):    ${fromWei(dexTokenBalance_before)} TTK, ${fromWei(dexEthBalance_before)} ETH`);
        
        console.log(`\n      ... user1 spende 1 ETH per comprare token ...\n`);
        const tx = await simpleDEX.connect(user1).buyToken({ value: ethToSpend });
        
        const receipt = await tx.wait();
        
        // Fix: Safely calculate gas cost with null checks
        let gasCost = 0n;
        if (receipt.gasUsed && receipt.gasPrice) {
            gasCost = receipt.gasUsed * receipt.gasPrice;
        } else if (receipt.gasUsed && receipt.effectiveGasPrice) {
            gasCost = receipt.gasUsed * receipt.effectiveGasPrice;
        } else {
            // Fallback: estimate gas cost
            console.log("Warning: Could not calculate exact gas cost, using estimate");
            gasCost = toWei(0.01); // Rough estimate
        }

        const userEthBalance_after = await ethers.provider.getBalance(user1.address);
        const userTokenBalance_after = await token.balanceOf(user1.address);
        const dexEthBalance_after = await ethers.provider.getBalance(await simpleDEX.getAddress());
        const dexTokenBalance_after = await token.balanceOf(await simpleDEX.getAddress());
        console.log(`      - UTENTE (dopo): ${fromWei(userTokenBalance_after)} TTK, ${parseFloat(fromWei(userEthBalance_after)).toFixed(4)} ETH`);
        console.log(`      - DEX (dopo):    ${fromWei(dexTokenBalance_after)} TTK, ${fromWei(dexEthBalance_after)} ETH`);

        // Check balances with tolerance for gas costs
        expect(userTokenBalance_after).to.equal(userTokenBalance_before + expectedTokensToReceive);
        expect(dexEthBalance_after).to.equal(dexEthBalance_before + ethToSpend);
        expect(dexTokenBalance_after).to.equal(dexTokenBalance_before - expectedTokensToReceive);
        
        // For ETH balance, check if it decreased by at least the ETH spent (plus some gas)
        expect(userEthBalance_after).to.be.lt(userEthBalance_before - ethToSpend);
    });

    it("Should correctly handle the full value exchange for a SELL operation", async function() {
        const tokensToSell = toWei(1500);
        const expectedEthToReceive = toWei(0.5);

        await token.connect(owner).transfer(user1.address, tokensToSell);
        await token.connect(user1).approve(await simpleDEX.getAddress(), tokensToSell);

        console.log("\n--- VERIFICA SCAMBIO: Vendere Token ---");
        const userEthBalance_before = await ethers.provider.getBalance(user1.address);
        const userTokenBalance_before = await token.balanceOf(user1.address);
        const dexEthBalance_before = await ethers.provider.getBalance(await simpleDEX.getAddress());
        const dexTokenBalance_before = await token.balanceOf(await simpleDEX.getAddress());
        console.log(`      - UTENTE (prima): ${fromWei(userTokenBalance_before)} TTK, ${parseFloat(fromWei(userEthBalance_before)).toFixed(4)} ETH`);
        console.log(`      - DEX (prima):    ${fromWei(dexTokenBalance_before)} TTK, ${fromWei(dexEthBalance_before)} ETH`);

        console.log(`\n      ... user1 vende 1500 TTK per ricevere ETH ...\n`);
        const tx = await simpleDEX.connect(user1).sellToken(tokensToSell);
        const receipt = await tx.wait();
        
        // Fix: Safely calculate gas cost with null checks
        let gasCost = 0n;
        if (receipt.gasUsed && receipt.gasPrice) {
            gasCost = receipt.gasUsed * receipt.gasPrice;
        } else if (receipt.gasUsed && receipt.effectiveGasPrice) {
            gasCost = receipt.gasUsed * receipt.effectiveGasPrice;
        } else {
            console.log("Warning: Could not calculate exact gas cost, using estimate");
            gasCost = toWei(0.01);
        }

        const userEthBalance_after = await ethers.provider.getBalance(user1.address);
        const userTokenBalance_after = await token.balanceOf(user1.address);
        const dexEthBalance_after = await ethers.provider.getBalance(await simpleDEX.getAddress());
        const dexTokenBalance_after = await token.balanceOf(await simpleDEX.getAddress());
        console.log(`      - UTENTE (dopo): ${fromWei(userTokenBalance_after)} TTK, ${parseFloat(fromWei(userEthBalance_after)).toFixed(4)} ETH`);
        console.log(`      - DEX (dopo):    ${fromWei(dexTokenBalance_after)} TTK, ${fromWei(dexEthBalance_after)} ETH`);

        // Check balances
        expect(userTokenBalance_after).to.equal(userTokenBalance_before - tokensToSell);
        expect(dexEthBalance_after).to.equal(dexEthBalance_before - expectedEthToReceive);
        expect(dexTokenBalance_after).to.equal(dexTokenBalance_before + tokensToSell);
        
        // For ETH balance, check if it increased by approximately the expected amount (minus gas)
        const ethReceived = userEthBalance_after - userEthBalance_before + gasCost;
        const tolerance = toWei(0.001); // Small tolerance for gas estimation
        expect(ethReceived).to.be.closeTo(expectedEthToReceive, tolerance);
    });
});
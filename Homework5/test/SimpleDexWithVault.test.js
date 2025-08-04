const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (value) => ethers.parseEther(value.toString());
const fromWei = (value) => ethers.formatEther(value.toString());

describe("SimpleDEX with Vault: Comprehensive Test Suite", function () {
    let Token, token, SimpleDexWithVault, simpleDexWithVault, LiquidityVault, liquidityVault, MockOracle, mockOracle;
    let owner, user1, user2;

    const ORACLE_DECIMALS = 8;
    const MOCK_PRICE = 3000 * 10 ** ORACLE_DECIMALS;

    before(async function () {
        // Get signers
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy Token
        Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Test Token", "TTK", toWei("1000000"));

        // Deploy Mock Oracle
        MockOracle = await ethers.getContractFactory("MockV3Aggregator");
        mockOracle = await MockOracle.deploy(ORACLE_DECIMALS, MOCK_PRICE);

        // Deploy LiquidityVault
        LiquidityVault = await ethers.getContractFactory("LiquidityVault");
        liquidityVault = await LiquidityVault.deploy(await token.getAddress());

        // Deploy SimpleDEXWithVault
        SimpleDexWithVault = await ethers.getContractFactory("SimpleDEXWithVault");
        simpleDexWithVault = await SimpleDexWithVault.deploy(await token.getAddress(), await mockOracle.getAddress());

        // Set the vault in the DEX
        await simpleDexWithVault.setLiquidityVault(await liquidityVault.getAddress());

        // FIXED: Use authorizeDEX() function, not authorizedDEX variable
        await liquidityVault.authorizeDEX(await simpleDexWithVault.getAddress());

        // Setup initial liquidity
        await token.transfer(await liquidityVault.getAddress(), toWei(50000));
        await owner.sendTransaction({ to: await liquidityVault.getAddress(), value: toWei(20) });

        console.log("Contracts deployed and initialized:");
        console.log(`- Token: ${await token.getAddress()}`);
        console.log(`- LiquidityVault: ${await liquidityVault.getAddress()}`);
        console.log(`- SimpleDEXWithVault: ${await simpleDexWithVault.getAddress()}`);
        console.log(`- MockOracle: ${await mockOracle.getAddress()}`);
        console.log(`- DEX authorized in vault: ${await liquidityVault.authorizedDEX()}`);
    });

    // ...rest of your tests remain the same...

    describe("Buy Token Operations", function() {
        it("Should correctly handle token purchase using vault", async function() {
            const ethToSpend = toWei(1);
            const expectedTokensToReceive = toWei(3000);

            console.log("\n--- VERIFICA SCAMBIO: Comprare Token (con Vault) ---");
            
            // Balances before
            const userEthBalance_before = await ethers.provider.getBalance(user1.address);
            const userTokenBalance_before = await token.balanceOf(user1.address);
            const vaultEthBalance_before = await liquidityVault.getEthBalance();
            const vaultTokenBalance_before = await liquidityVault.getTokenBalance();
            
            console.log(`      - UTENTE (prima): ${fromWei(userTokenBalance_before)} TTK, ${parseFloat(fromWei(userEthBalance_before)).toFixed(4)} ETH`);
            console.log(`      - VAULT (prima):  ${fromWei(vaultTokenBalance_before)} TTK, ${fromWei(vaultEthBalance_before)} ETH`);

            console.log(`\n      ... user1 spende 1 ETH per comprare token ...\n`);
            
            const tx = await simpleDexWithVault.connect(user1).buyToken({ value: ethToSpend });
            const receipt = await tx.wait();

            // Calculate gas cost
            let gasCost = 0n;
            if (receipt.gasUsed && receipt.effectiveGasPrice) {
                gasCost = receipt.gasUsed * receipt.effectiveGasPrice;
            }

            // Balances after
            const userEthBalance_after = await ethers.provider.getBalance(user1.address);
            const userTokenBalance_after = await token.balanceOf(user1.address);
            const vaultEthBalance_after = await liquidityVault.getEthBalance();
            const vaultTokenBalance_after = await liquidityVault.getTokenBalance();
            
            console.log(`      - UTENTE (dopo): ${fromWei(userTokenBalance_after)} TTK, ${parseFloat(fromWei(userEthBalance_after)).toFixed(4)} ETH`);
            console.log(`      - VAULT (dopo):  ${fromWei(vaultTokenBalance_after)} TTK, ${fromWei(vaultEthBalance_after)} ETH`);

            // Verify token transfer
            expect(userTokenBalance_after).to.equal(userTokenBalance_before + expectedTokensToReceive);
            expect(vaultTokenBalance_after).to.equal(vaultTokenBalance_before - expectedTokensToReceive);
            
            // Verify ETH transfer
            expect(vaultEthBalance_after).to.equal(vaultEthBalance_before + ethToSpend);
            
            // Check user ETH balance decreased
            expect(userEthBalance_after).to.be.lt(userEthBalance_before - ethToSpend);
        });
    });

    describe("Sell Token Operations", function() {
        it("Should correctly handle token sale using vault", async function() {
            const tokensToSell = toWei(1500);
            const expectedEthToReceive = toWei(0.5);

            // Give user some tokens to sell
            await token.connect(owner).transfer(user1.address, tokensToSell);
            await token.connect(user1).approve(await simpleDexWithVault.getAddress(), tokensToSell);

            console.log("\n--- VERIFICA SCAMBIO: Vendere Token (con Vault) ---");
            
            // Balances before
            const userEthBalance_before = await ethers.provider.getBalance(user1.address);
            const userTokenBalance_before = await token.balanceOf(user1.address);
            const vaultEthBalance_before = await liquidityVault.getEthBalance();
            const vaultTokenBalance_before = await liquidityVault.getTokenBalance();
            
            console.log(`      - UTENTE (prima): ${fromWei(userTokenBalance_before)} TTK, ${parseFloat(fromWei(userEthBalance_before)).toFixed(4)} ETH`);
            console.log(`      - VAULT (prima):  ${fromWei(vaultTokenBalance_before)} TTK, ${fromWei(vaultEthBalance_before)} ETH`);

            console.log(`\n      ... user1 vende ${fromWei(tokensToSell)} TTK per ricevere ETH ...\n`);
            
            const tx = await simpleDexWithVault.connect(user1).sellToken(tokensToSell);
            const receipt = await tx.wait();

            // Calculate gas cost
            let gasCost = 0n;
            if (receipt.gasUsed && receipt.effectiveGasPrice) {
                gasCost = receipt.gasUsed * receipt.effectiveGasPrice;
            }

            // Balances after
            const userEthBalance_after = await ethers.provider.getBalance(user1.address);
            const userTokenBalance_after = await token.balanceOf(user1.address);
            const vaultEthBalance_after = await liquidityVault.getEthBalance();
            const vaultTokenBalance_after = await liquidityVault.getTokenBalance();
            
            console.log(`      - UTENTE (dopo): ${fromWei(userTokenBalance_after)} TTK, ${parseFloat(fromWei(userEthBalance_after)).toFixed(4)} ETH`);
            console.log(`      - VAULT (dopo):  ${fromWei(vaultTokenBalance_after)} TTK, ${fromWei(vaultEthBalance_after)} ETH`);

            // Verify token transfer
            expect(userTokenBalance_after).to.equal(userTokenBalance_before - tokensToSell);
            expect(vaultTokenBalance_after).to.equal(vaultTokenBalance_before + tokensToSell);
            
            // Verify ETH transfer
            expect(vaultEthBalance_after).to.equal(vaultEthBalance_before - expectedEthToReceive);
            
            // Check if user received approximately the expected ETH (accounting for gas)
            const ethReceived = userEthBalance_after - userEthBalance_before + gasCost;
            const tolerance = toWei(0.001); // Small tolerance for gas estimation
            expect(ethReceived).to.be.closeTo(expectedEthToReceive, tolerance);
        });

        it("Should reject sell when vault has insufficient ETH", async function() {
            // Try to sell tokens that would require more ETH than available in vault
            const largeTokenAmount = toWei(100000); // This would require more ETH than available
            
            // Give user tokens to sell
            await token.connect(owner).transfer(user2.address, largeTokenAmount);
            await token.connect(user2).approve(await simpleDexWithVault.getAddress(), largeTokenAmount);
            
            await expect(
                simpleDexWithVault.connect(user2).sellToken(largeTokenAmount)
            ).to.be.revertedWith("Not enough ethers in the vault");
        });
    });

    describe("Owner Functions", function() {
        it("Should allow owner to deposit tokens to vault", async function() {
            const depositAmount = toWei(1000);
            
            // Approve the DEX to transfer tokens
            await token.connect(owner).approve(await simpleDexWithVault.getAddress(), depositAmount);
            
            const vaultTokenBalance_before = await liquidityVault.getTokenBalance();
            
            await simpleDexWithVault.connect(owner).depositTokensToVault(depositAmount);
            
            const vaultTokenBalance_after = await liquidityVault.getTokenBalance();
            expect(vaultTokenBalance_after).to.equal(vaultTokenBalance_before + depositAmount);
        });

        it("Should allow owner to deposit ETH to vault", async function() {
            const depositAmount = toWei(1);
            
            const vaultEthBalance_before = await liquidityVault.getEthBalance();
            
            await simpleDexWithVault.connect(owner).depositEthToVault({ value: depositAmount });
            
            const vaultEthBalance_after = await liquidityVault.getEthBalance();
            expect(vaultEthBalance_after).to.equal(vaultEthBalance_before + depositAmount);
        });
    });
});
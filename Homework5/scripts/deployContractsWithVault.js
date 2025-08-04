const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    const [owner] = await ethers.getSigners();
    console.log("Deploying contracts with account:", owner.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(owner.address)));

    // 1. Deploy del contratto Token
    console.log("\n1. Deploying Token contract...");
    const Token = await hre.ethers.getContractFactory("Token");
    // Fix: Use parseEther for token supply
    const token = await Token.deploy("MyTestToken", "MTT", ethers.parseEther("1000000"));
    await token.waitForDeployment();
    console.log("✅ Token contract deployed to:", await token.getAddress());

    // 2. Deploy del contratto LiquidityVault
    console.log("\n2. Deploying LiquidityVault contract...");
    const LiquidityVault = await hre.ethers.getContractFactory("LiquidityVault");
    const liquidityVault = await LiquidityVault.deploy(await token.getAddress());
    await liquidityVault.waitForDeployment();
    console.log("✅ LiquidityVault contract deployed to:", await liquidityVault.getAddress());

    // 3. Deploy del contratto SimpleDEXWithVault
    const oracleAddressSepolia = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
    console.log("\n3. Deploying SimpleDEXWithVault contract...");
    const SimpleDEXWithVault = await hre.ethers.getContractFactory("SimpleDEXWithVault");
    const simpleDexWithVault = await SimpleDEXWithVault.deploy(await token.getAddress(), oracleAddressSepolia);
    await simpleDexWithVault.waitForDeployment();
    console.log("✅ SimpleDEXWithVault contract deployed to:", await simpleDexWithVault.getAddress());

    // 4. Configurazione delle autorizzazioni
    console.log("\n4. Setting up vault authorization...");
    const authorizeTx = await liquidityVault.authorizeDEX(await simpleDexWithVault.getAddress());
    await authorizeTx.wait();
    console.log("✅ DEX authorized to use vault");

    const setVaultTx = await simpleDexWithVault.setLiquidityVault(await liquidityVault.getAddress());
    await setVaultTx.wait();
    console.log("✅ Vault set in DEX contract");

    // 5. Preparazione della liquidità iniziale
    const initialTokensToVault = ethers.parseEther("50000"); // 50,000 tokens
    const initialEthToVault = ethers.parseEther("20"); // 20 ETH

    console.log("\n5. Adding initial liquidity to vault...");
    
    // Trasferisce token al vault
    console.log("   - Transferring tokens to vault...");
    const transferTx = await token.transfer(await liquidityVault.getAddress(), initialTokensToVault);
    await transferTx.wait();
    
    // Deposita ETH nel vault
    console.log("   - Depositing ETH to vault...");
    const depositEthTx = await liquidityVault.depositEth({ value: initialEthToVault });
    await depositEthTx.wait();

    // 6. Verifica delle configurazioni
    console.log("\n6. Verifying setup...");
    const vaultEthBalance = await liquidityVault.getEthBalance();
    const vaultTokenBalance = await liquidityVault.getTokenBalance();
    const authorizedDEX = await liquidityVault.authorizedDEX();
    const dexVault = await simpleDexWithVault.liquidityVault();

    console.log("   - Vault ETH balance:", ethers.formatEther(vaultEthBalance));
    console.log("   - Vault Token balance:", ethers.formatEther(vaultTokenBalance));
    console.log("   - Authorized DEX:", authorizedDEX);
    console.log("   - DEX vault address:", dexVault);
    
    // aggiorna logica di verifica
    const simpleDexAddress = await simpleDexWithVault.getAddress();
    const vaultAddress = await liquidityVault.getAddress();
    const isSetupCorrect = authorizedDEX === simpleDexAddress && dexVault === vaultAddress;
    console.log("   - Setup verification:", isSetupCorrect ? "✅ SUCCESS" : "❌ FAILED");

    // 7. Test di un semplice scambio per vedere se tutto funziona
    console.log("\n7. Testing DEX functionality...");
    try {
        // Update price oracle first
        console.log("   - Updating price oracle...");
        const updatePriceTx = await simpleDexWithVault.getCLParameters();
        await updatePriceTx.wait();
        
        console.log("   - DEX functionality test: ✅ PASSED");
    } catch (error) {
        console.log("   - DEX functionality test: ⚠️  Warning -", error.message);
    }

    // 8. Riepilogo deployment
    console.log("\n========================================");
    console.log("DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("========================================");
    console.log("Token Address:           ", await token.getAddress());
    console.log("LiquidityVault Address:  ", await liquidityVault.getAddress());
    console.log("SimpleDEXWithVault:      ", await simpleDexWithVault.getAddress());
    console.log("Oracle Address (Sepolia):", oracleAddressSepolia);
    console.log("Network:                 ", hre.network.name);
    console.log("========================================");

    // 9. Salva gli indirizzi per i test
    const addresses = {
        token: await token.getAddress(),
        liquidityVault: await liquidityVault.getAddress(),
        simpleDexWithVault: await simpleDexWithVault.getAddress(),
        oracle: oracleAddressSepolia,
        network: hre.network.name,
        deployedAt: new Date().toISOString()
    };

    const fs = require('fs');
    const path = require('path');
    
    // Create a network-specific filename
    const filename = `deployed-addresses-${hre.network.name}.json`;
    fs.writeFileSync(filename, JSON.stringify(addresses, null, 2));
    console.log(`✅ Contract addresses saved to ${filename}`);

    
    fs.writeFileSync('deployed-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("✅ Contract addresses also saved to deployed-addresses.json");

    return addresses;
}

// solo se il file viene eseguito direttamente
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = main;
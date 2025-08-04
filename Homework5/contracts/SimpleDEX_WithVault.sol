// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PriceConsumer.sol";
import "./LiquidityVault.sol";

/**
 * @title SimpleDEX
 * @dev DEX semplificato che utilizza un vault esterno per la gestione della liquidità
 */
contract SimpleDEXWithVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Contratti collegati
    address public immutable token;
    PriceConsumer public immutable ethUsdContract;
    LiquidityVault public liquidityVault;

    // Parametri del prezzo
    uint256 public ethPriceDecimals;
    uint256 public ethPrice;

    // Eventi
    event Bought(address indexed buyer, uint256 ethSpent, uint256 tokensReceived);
    event Sold(address indexed seller, uint256 tokensSold, uint256 ethReceived);
    event VaultSet(address indexed vaultAddress);
    event PriceUpdated(uint256 newPrice, uint256 decimals);

    // Modificatori
    modifier vaultSet() {
        require(address(liquidityVault) != address(0), "Liquidity vault not set");
        _;
    }

    /**
     * @dev Costruttore del DEX
     * @param _token Indirizzo del token da scambiare
     * @param oracleEthUSDPrice Indirizzo dell'oracle Chainlink per ETH/USD
     */
    constructor(address _token, address oracleEthUSDPrice) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        require(oracleEthUSDPrice != address(0), "Invalid oracle address");
        
        token = _token;
        ethUsdContract = new PriceConsumer(oracleEthUSDPrice);
    }

    /**
     * @dev Imposta il contratto vault per la liquidità
     * @param _vaultAddress Indirizzo del contratto vault
     */
    function setLiquidityVault(address _vaultAddress) external onlyOwner {
        require(_vaultAddress != address(0), "Invalid vault address");
        liquidityVault = LiquidityVault(payable(_vaultAddress));
        emit VaultSet(_vaultAddress);
    }

    /**
     * @dev Ottiene i parametri del prezzo da Chainlink
     */
    function getCLParameters() public {
        ethPriceDecimals = ethUsdContract.getPriceDecimals();
        ethPrice = uint256(ethUsdContract.getLatestPrice());
        emit PriceUpdated(ethPrice, ethPriceDecimals);
    }

    /**
     * @dev Compra token inviando ETH
     */
    function buyToken() external payable nonReentrant vaultSet {
        require(msg.value > 0, "You need to send some ether");
        
        // Aggiorna i parametri del prezzo
        getCLParameters();
        
        // Calcola i token da inviare
        uint256 tokensToSend = msg.value * ethPrice / (10 ** ethPriceDecimals);
        require(tokensToSend > 0, "Token amount too small");
        
        // Verifica che il vault abbia abbastanza token
        require(
            liquidityVault.getTokenBalance() >= tokensToSend, 
            "Not enough tokens in the vault"
        );
        
        // Deposita l'ETH ricevuto nel vault
        liquidityVault.depositEth{value: msg.value}();
        
        // Preleva i token dal vault e li invia al compratore
        liquidityVault.withdrawTokens(msg.sender, tokensToSend);
        
        emit Bought(msg.sender, msg.value, tokensToSend);
    }

    /**
     * @dev Vende token per ricevere ETH
     * @param tokenAmount Quantità di token da vendere
     */
    function sellToken(uint256 tokenAmount) external nonReentrant vaultSet {
        require(tokenAmount > 0, "You need to sell at least some tokens");
        
        // Verifica l'allowance
        uint256 allowance = IERC20(token).allowance(msg.sender, address(this));
        require(allowance >= tokenAmount, "Check the token allowance");
        
        // Aggiorna i parametri del prezzo
        getCLParameters();
        
        // Calcola l'ETH da inviare
        uint256 ethToSend = tokenAmount * (10 ** ethPriceDecimals) / ethPrice;
        require(ethToSend > 0, "ETH amount too small");
        
        // Verifica che il vault abbia abbastanza ETH
        require(
            liquidityVault.getEthBalance() >= ethToSend, 
            "Not enough ethers in the vault"
        );
        
        // Trasferisce i token dal venditore al vault
        IERC20(token).safeTransferFrom(msg.sender, address(liquidityVault), tokenAmount);
        
        // Preleva ETH dal vault e li invia al venditore
        liquidityVault.withdrawEth(payable(msg.sender), ethToSend);
        
        emit Sold(msg.sender, tokenAmount, ethToSend);
    }

    /**
     * @dev Deposita token nel vault (solo owner)
     * @param amount Quantità di token da depositare
     */
    function depositTokensToVault(uint256 amount) external onlyOwner vaultSet {
    require(amount > 0, "Amount must be greater than 0");
    
    // Trasferisce i token dal DEX al vault
    IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    
    // Use safeIncreaseAllowance instead of safeApprove
    IERC20(token).safeIncreaseAllowance(address(liquidityVault), amount);
    
    liquidityVault.depositTokens(amount);
}
    /**
     * @dev Deposita ETH nel vault (solo owner)
     */
    function depositEthToVault() external payable onlyOwner vaultSet {
        require(msg.value > 0, "Must send ETH to deposit");
        liquidityVault.depositEth{value: msg.value}();
    }

    /**
     * @dev Calcola quanti token si riceverebbero per una certa quantità di ETH
     * @param ethAmount Quantità di ETH
     * @return Quantità di token che si riceverebbero
     */
    function calculateTokensForEth(uint256 ethAmount) external view returns (uint256) {
        if (ethAmount == 0) return 0;
        
        uint256 currentEthPrice = uint256(ethUsdContract.getLatestPrice());
        uint256 currentDecimals = ethUsdContract.getPriceDecimals();
        
        return ethAmount * currentEthPrice / (10 ** currentDecimals);
    }

    /**
     * @dev Calcola quanto ETH si riceverebbe per una certa quantità di token
     * @param tokenAmount Quantità di token
     * @return Quantità di ETH che si riceverebbe
     */
    function calculateEthForTokens(uint256 tokenAmount) external view returns (uint256) {
        if (tokenAmount == 0) return 0;
        
        uint256 currentEthPrice = uint256(ethUsdContract.getLatestPrice());
        uint256 currentDecimals = ethUsdContract.getPriceDecimals();
        
        return tokenAmount * (10 ** currentDecimals) / currentEthPrice;
    }

    /**
     * @dev Restituisce le informazioni sulla liquidità del vault
     */
    function getVaultLiquidity() external view vaultSet returns (uint256 ethBalance, uint256 tokenBalance) {
        ethBalance = liquidityVault.getEthBalance();
        tokenBalance = liquidityVault.getTokenBalance();
    }

    /**
     * @dev Verifica se il vault ha abbastanza liquidità per uno scambio
     * @param ethAmount Quantità di ETH richiesta
     * @param tokenAmount Quantità di token richiesta
     */
    function checkVaultLiquidity(uint256 ethAmount, uint256 tokenAmount) external view vaultSet returns (bool) {
        return liquidityVault.hasLiquidity(ethAmount, tokenAmount);
    }

    /**
     * @dev Ottiene il prezzo corrente dell'ETH
     */
    function getCurrentPrice() external view returns (uint256 price, uint256 decimals) {
        price = uint256(ethUsdContract.getLatestPrice());
        decimals = ethUsdContract.getPriceDecimals();
    }

    /**
     * @dev Funzione di riserva per ricevere ETH (non dovrebbe essere utilizzata con il vault)
     */
    receive() external payable {
        revert("Use buyToken() function instead");
    }
}
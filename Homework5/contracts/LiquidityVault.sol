// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LiquidityVault
 * @dev Contratto vault per gestire la liquidità del SimpleDEX
 * Separa la gestione dei fondi dalla logica di trading
 */
contract LiquidityVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Token gestito dal vault
    address public immutable token;
    
    // Indirizzo del DEX autorizzato a prelevare fondi
    address public authorizedDEX;
    
    // Eventi
    event EthDeposited(address indexed depositor, uint256 amount);
    event TokensDeposited(address indexed depositor, uint256 amount);
    event EthWithdrawn(address indexed recipient, uint256 amount);
    event TokensWithdrawn(address indexed recipient, uint256 amount);
    event DEXAuthorized(address indexed dexAddress);
    event EmergencyWithdrawal(address indexed owner, uint256 ethAmount, uint256 tokenAmount);

    // Modificatori
    modifier onlyAuthorizedDEX() {
        require(msg.sender == authorizedDEX, "Only authorized DEX can call this function");
        _;
    }

    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid address");
        _;
    }

    /**
     * @dev Costruttore del vault
     * @param _token Indirizzo del token ERC20 da gestire
     */
    constructor(address _token) Ownable(msg.sender) validAddress(_token) {
        token = _token;
    }

    /**
     * @dev Autorizza un contratto DEX a prelevare fondi dal vault
     * @param _dexAddress Indirizzo del contratto DEX
     */
    function authorizeDEX(address _dexAddress) external onlyOwner validAddress(_dexAddress) {
        authorizedDEX = _dexAddress;
        emit DEXAuthorized(_dexAddress);
    }

    /**
     * @dev Deposita ETH nel vault
     */
    function depositEth() external payable {
        require(msg.value > 0, "Must send ETH to deposit");
        emit EthDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Deposita token nel vault
     * @param amount Quantità di token da depositare
     */
    function depositTokens(uint256 amount) external {
        require(amount > 0, "Must deposit some tokens");
        
        // Trasferisce i token dal mittente al vault
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        emit TokensDeposited(msg.sender, amount);
    }

    /**
     * @dev Preleva ETH dal vault (solo DEX autorizzato)
     * @param recipient Indirizzo del destinatario
     * @param amount Quantità di ETH da prelevare
     */
    function withdrawEth(address payable recipient, uint256 amount) 
        external 
        onlyAuthorizedDEX 
        nonReentrant 
        validAddress(recipient) 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient ETH balance in vault");
        
        recipient.transfer(amount);
        emit EthWithdrawn(recipient, amount);
    }

    /**
     * @dev Preleva token dal vault (solo DEX autorizzato)
     * @param recipient Indirizzo del destinatario
     * @param amount Quantità di token da prelevare
     */
    function withdrawTokens(address recipient, uint256 amount) 
        external 
        onlyAuthorizedDEX 
        nonReentrant 
        validAddress(recipient) 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(getTokenBalance() >= amount, "Insufficient token balance in vault");
        
        IERC20(token).safeTransfer(recipient, amount);
        emit TokensWithdrawn(recipient, amount);
    }

    /**
     * @dev Restituisce il saldo ETH del vault
     */
    function getEthBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Restituisce il saldo token del vault
     */
    function getTokenBalance() public view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @dev Verifica se il vault ha abbastanza liquidità per uno scambio
     * @param ethAmount Quantità di ETH richiesta
     * @param tokenAmount Quantità di token richiesta
     */
    function hasLiquidity(uint256 ethAmount, uint256 tokenAmount) external view returns (bool) {
        return address(this).balance >= ethAmount && getTokenBalance() >= tokenAmount;
    }

    /**
     * @dev Prelievo di emergenza da parte del proprietario
     * Utilizzare solo in caso di emergenza assoluta
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 ethBalance = address(this).balance;
        uint256 tokenBalance = getTokenBalance();
        
        if (ethBalance > 0) {
            payable(owner()).transfer(ethBalance);
        }
        
        if (tokenBalance > 0) {
            IERC20(token).safeTransfer(owner(), tokenBalance);
        }
        
        emit EmergencyWithdrawal(owner(), ethBalance, tokenBalance);
    }

    /**
     * @dev Riceve ETH direttamente
     */
    receive() external payable {
        emit EthDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Fallback function
     */
    fallback() external payable {
        emit EthDeposited(msg.sender, msg.value);
    }
}
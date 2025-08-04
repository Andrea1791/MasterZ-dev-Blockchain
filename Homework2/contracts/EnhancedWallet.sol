//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EnhancedWallet is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Errori personalizzati
    error NoTokensToWithdraw();
    error InsufficientBalance();
    error InvalidAmount();
    error OracleNotSet();
    error NFTNotOwned();
    error TransferFailed();

    // Costanti
    uint public constant USD_DECIMALS = 2;

    // Mapping per oracle di diversi token
    mapping(address => address) public tokenOracles;
    
    // Depositi per token ERC-20 (user => token => amount)
    mapping(address => mapping(address => uint256)) public userTokenDeposits;
    
    // NFT posseduti dagli utenti (user => nftContract => tokenIds[])
    mapping(address => mapping(address => uint256[])) public userNFTs;
    
    // Listing NFT per vendita (nftContract => tokenId => seller)
    mapping(address => mapping(uint256 => address)) public nftListings;
    
    // Prezzi NFT in USD (nftContract => tokenId => priceUSD)
    mapping(address => mapping(uint256 => uint256)) public nftPrices;

    // Eventi
    event TokenDeposited(address indexed user, address indexed token, uint256 amount);
    event TokenWithdrawn(address indexed user, address indexed token, uint256 amount);
    event NFTListed(address indexed seller, address indexed nftContract, uint256 tokenId, uint256 priceUSD);
    event NFTSold(address indexed seller, address indexed buyer, address indexed nftContract, uint256 tokenId, address paymentToken, uint256 price);
    event NFTDeposited(address indexed user, address indexed nftContract, uint256 tokenId);
    event NFTWithdrawn(address indexed user, address indexed nftContract, uint256 tokenId);
    event OracleSet(address indexed token, address indexed oracle);

    constructor() {}

    // ===================== GESTIONE TOKEN ERC-20 =====================

    /**
     * @dev Deposita token ERC-20 nel wallet
     * @param token Indirizzo del contratto token
     * @param amount Quantità da depositare
     */
    function depositToken(address token, uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        userTokenDeposits[msg.sender][token] += amount;
        
        emit TokenDeposited(msg.sender, token, amount);
    }

    /**
     * @dev Preleva token ERC-20 dal wallet
     * @param token Indirizzo del contratto token
     * @param amount Quantità da prelevare
     */
    function withdrawToken(address token, uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (userTokenDeposits[msg.sender][token] < amount) revert InsufficientBalance();
        
        userTokenDeposits[msg.sender][token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit TokenWithdrawn(msg.sender, token, amount);
    }

    /**
     * @dev Ottieni il saldo di un token per un utente
     * @param user Indirizzo utente
     * @param token Indirizzo del contratto token
     * @return Saldo del token
     */
    function getTokenBalance(address user, address token) external view returns (uint256) {
        return userTokenDeposits[user][token];
    }

    // ===================== GESTIONE NFT =====================

    /**
     * @dev Deposita un NFT nel wallet
     * @param nftContract Indirizzo del contratto NFT
     * @param tokenId ID del token NFT
     */
    function depositNFT(address nftContract, uint256 tokenId) external {
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        userNFTs[msg.sender][nftContract].push(tokenId);
        
        emit NFTDeposited(msg.sender, nftContract, tokenId);
    }

    /**
     * @dev Preleva un NFT dal wallet
     * @param nftContract Indirizzo del contratto NFT
     * @param tokenId ID del token NFT
     */
    function withdrawNFT(address nftContract, uint256 tokenId) external {
        if (!_ownsNFT(msg.sender, nftContract, tokenId)) revert NFTNotOwned();
        
        _removeNFTFromUser(msg.sender, nftContract, tokenId);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        
        emit NFTWithdrawn(msg.sender, nftContract, tokenId);
    }

    /**
     * @dev Lista un NFT per la vendita
     * @param nftContract Indirizzo del contratto NFT
     * @param tokenId ID del token NFT
     * @param priceInUSD Prezzo in USD (con 2 decimali, es: 10000 = $100.00)
     */
    function listNFTForSale(address nftContract, uint256 tokenId, uint256 priceInUSD) external {
        if (!_ownsNFT(msg.sender, nftContract, tokenId)) revert NFTNotOwned();
        if (priceInUSD == 0) revert InvalidAmount();
        
        nftListings[nftContract][tokenId] = msg.sender;
        nftPrices[nftContract][tokenId] = priceInUSD;
        
        emit NFTListed(msg.sender, nftContract, tokenId, priceInUSD);
    }

    /**
     * @dev Acquista un NFT pagando con un token specifico
     * @param nftContract Indirizzo del contratto NFT
     * @param tokenId ID del token NFT
     * @param paymentToken Token con cui pagare
     */
    function buyNFT(address nftContract, uint256 tokenId, address paymentToken) external nonReentrant {
        address seller = nftListings[nftContract][tokenId];
        if (seller == address(0)) revert NFTNotOwned();
        
        uint256 priceUSD = nftPrices[nftContract][tokenId];
        uint256 priceInToken = convertUSDToToken(paymentToken, priceUSD);
        
        // Verifica che l'acquirente abbia abbastanza token
        if (userTokenDeposits[msg.sender][paymentToken] < priceInToken) revert InsufficientBalance();
        
        // Trasferimento pagamento
        userTokenDeposits[msg.sender][paymentToken] -= priceInToken;
        userTokenDeposits[seller][paymentToken] += priceInToken;
        
        // Trasferimento NFT
        _removeNFTFromUser(seller, nftContract, tokenId);
        userNFTs[msg.sender][nftContract].push(tokenId);
        
        // Rimuovi dal listing
        delete nftListings[nftContract][tokenId];
        delete nftPrices[nftContract][tokenId];
        
        emit NFTSold(seller, msg.sender, nftContract, tokenId, paymentToken, priceInToken);
    }

    // ===================== CONVERSIONI CON ORACLE =====================

    /**
     * @dev Converte un importo USD nel token equivalente usando l'oracle
     * @param token Indirizzo del token
     * @param usdAmount Importo in USD (con 2 decimali)
     * @return Importo equivalente nel token
     */
    function convertUSDToToken(address token, uint256 usdAmount) public view returns (uint256) {
        address oracle = tokenOracles[token];
        if (oracle == address(0)) revert OracleNotSet();
        
        AggregatorV3Interface priceFeed = AggregatorV3Interface(oracle);
        (, int price, , , ) = priceFeed.latestRoundData();
        
        uint8 priceDecimals = priceFeed.decimals();
        uint8 tokenDecimals = IERC20Metadata(token).decimals();
        
        // Formula: usdAmount * 10^tokenDecimals / (price * 10^(priceDecimals-USD_DECIMALS))
        uint256 adjustedPrice = uint256(price) * (10 ** (priceDecimals > USD_DECIMALS ? 0 : USD_DECIMALS - priceDecimals));
        uint256 result = (usdAmount * (10 ** tokenDecimals)) / adjustedPrice;
        
        return result;
    }

    /**
     * @dev Converte un importo di token in USD usando l'oracle
     * @param token Indirizzo del token
     * @param tokenAmount Importo del token
     * @return Importo equivalente in USD (con 2 decimali)
     */
    function convertTokenToUSD(address token, uint256 tokenAmount) public view returns (uint256) {
        address oracle = tokenOracles[token];
        if (oracle == address(0)) revert OracleNotSet();
        
        AggregatorV3Interface priceFeed = AggregatorV3Interface(oracle);
        (, int price, , , ) = priceFeed.latestRoundData();
        
        uint8 priceDecimals = priceFeed.decimals();
        uint8 tokenDecimals = IERC20Metadata(token).decimals();
        
        // Formula: tokenAmount * price * 10^(USD_DECIMALS) / (10^priceDecimals * 10^tokenDecimals)
        uint256 usdAmount = (tokenAmount * uint256(price) * (10 ** USD_DECIMALS)) / 
                           (10 ** (priceDecimals + tokenDecimals));
        
        return usdAmount;
    }

    // ===================== FUNZIONI AMMINISTRATIVE =====================

    /**
     * @dev Imposta l'oracle per un token (solo owner)
     * @param token Indirizzo del token
     * @param oracle Indirizzo dell'oracle Chainlink
     */
    function setTokenOracle(address token, address oracle) external onlyOwner {
        tokenOracles[token] = oracle;
        emit OracleSet(token, oracle);
    }

    // ===================== FUNZIONI HELPER =====================

    /**
     * @dev Verifica se un utente possiede un NFT specifico
     */
    function _ownsNFT(address user, address nftContract, uint256 tokenId) internal view returns (bool) {
        uint256[] memory userTokens = userNFTs[user][nftContract];
        for (uint i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) return true;
        }
        return false;
    }

    /**
     * @dev Rimuove un NFT dalla lista dell'utente
     */
    function _removeNFTFromUser(address user, address nftContract, uint256 tokenId) internal {
        uint256[] storage userTokens = userNFTs[user][nftContract];
        for (uint i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
    }

    /**
     * @dev Ottieni tutti gli NFT di un utente per un contratto specifico
     */
    function getUserNFTs(address user, address nftContract) external view returns (uint256[] memory) {
        return userNFTs[user][nftContract];
    }

    /**
     * @dev Verifica se un NFT è in vendita
     */
    function isNFTListed(address nftContract, uint256 tokenId) external view returns (bool, address, uint256) {
        address seller = nftListings[nftContract][tokenId];
        uint256 price = nftPrices[nftContract][tokenId];
        return (seller != address(0), seller, price);
    }
}
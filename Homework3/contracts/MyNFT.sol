// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC1155, Ownable(msg.sender) {
    
    // --- ID per TUTTI i tuoi token ---
    uint256 public constant GOLD_COIN = 0;
    uint256 public constant LEGENDARY_SWORD = 1;
    uint256 public constant VALOROUS_SWORD = 2; // Spada del Valoroso
    uint256 public constant HERO_SWORD = 3;      // Spada dell'Eroe
    uint256 public constant COMMON_SWORD = 4;    // Spada Comune

    // --- Costruttore ---
    // Assicurati che questo CID sia quello della cartella con TUTTI e 5 i file di metadati (0, 1, 2, 3, 4)
    constructor() ERC1155("ipfs://bafybeihnouxypk3ufwdshvb4ej4mdvfcg3dg6qywygwdgpl6g2yishlmki/{id}.json") {
        
        // --- Conia tutti i token al momento del deploy ---
        
        // Token originali
        _mint(msg.sender, GOLD_COIN, 1000, "");       // 1000 monete d'oro
        _mint(msg.sender, LEGENDARY_SWORD, 1, "");    // 1 spada leggendaria
        _mint(msg.sender, VALOROUS_SWORD, 1, "");
        _mint(msg.sender, HERO_SWORD, 1, "");
        _mint(msg.sender, COMMON_SWORD, 1, "");
    }

   /**
     * @notice Permette al proprietario di coniare nuovi token.
     * @param account L'indirizzo che riceverà i nuovi token.
     * @param id L'ID del token da coniare.
     * @param amount La quantità di token da coniare.
     * @param data Dati addizionali (solitamente vuoti).
     */
    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }
}
// --- Nota: Assicurati di avere i metadati corretti per ogni ID token nel CID specificato nel costruttore.
// --- I metadati devono essere in formato JSON e seguire lo standard ERC1155
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// === MODIFICHE QUI ===
// Importiamo le versioni "-upgradeable" dei contratti. Nota il percorso e il suffisso "Upgradeable".
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// === MODIFICA QUI ===
// Ereditiamo dai contratti corretti che abbiamo appena importato.
contract MyNFT is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    uint256 private _nextTokenId;

    // La funzione che sostituisce il constructor
    function initialize(string memory name, string memory symbol, address initialOwner) public initializer {
        // Ora queste funzioni esistono, perché provengono dai contratti "Upgradeable".
        __ERC721_init(name, symbol);
        __Ownable_init(initialOwner);
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }
}
// File: contracts/NotaryV1.sol (MODIFICATO)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol"; // <-- 1. IMPORTA UUPS
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol"; // <-- IMPORTA ANCHE QUESTO PER L'OWNER

// 2. EREDITA DA UUPSUpgradeable e OwnableUpgradeable
contract NotaryV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    mapping(bytes32 => address) internal _documents;
    // L'owner ora viene gestito da OwnableUpgradeable

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        // Inizializza i contratti ereditati
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    // Aggiungiamo questa funzione OBBLIGATORIA per il pattern UUPS.
    // Dice chi è autorizzato a eseguire gli upgrade.
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner // Solo il proprietario può aggiornare
        override
    {}

    // La nostra logica
    function addDocument(bytes32 documentHash) public {
        require(_documents[documentHash] == address(0), "Document already exists");
        _documents[documentHash] = msg.sender;
    }

    function getDocumentOwner(bytes32 documentHash) public view returns (address) {
        return _documents[documentHash];
    }
    
    // Non ci serve più getOwner(), useremo owner() di Ownable.
}
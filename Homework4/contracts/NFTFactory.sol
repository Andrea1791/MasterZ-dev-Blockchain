// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./MyNFT.sol";

contract NFTFactory {
    // L'indirizzo del nostro contratto modello, immutabile.
    address public immutable implementation;

    // Teniamo traccia di tutti i cloni creati.
    address[] public deployedClones;

    event NFTCloned(address indexed cloneAddress, address indexed owner, string name, string symbol);

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function createNFT(string memory name, string memory symbol) public returns (address) {
        // 1. Crea il clone
        address cloneAddress = Clones.clone(implementation);

        // 2. Inizializza il clone chiamando la sua funzione `initialize`
        MyNFT(cloneAddress).initialize(name, symbol, msg.sender);

        // 3. Salva e notifica
        deployedClones.push(cloneAddress);
        emit NFTCloned(cloneAddress, msg.sender, name, symbol);
        return cloneAddress;
    }
}
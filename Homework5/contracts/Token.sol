// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Token
 * @dev Un semplice contratto di token ERC20 che eredita le funzionalità di base
 * da OpenZeppelin, oltre alla proprietà (Ownable).
 */
contract Token is ERC20, Ownable {
    /**
     * @dev Costruisce il token, imposta il nome e il simbolo, e conia la fornitura iniziale
     * di token all'indirizzo del deployer del contratto.
     * @param _tokenName Il nome del token.
     * @param _tokenSymbol Il simbolo del token.
     * @param _supply La fornitura iniziale di token (verrà moltiplicata per 10**18).
     */
    // LA LINEA CORRETTA
constructor(string memory _tokenName, string memory _tokenSymbol, uint256 _supply) ERC20(_tokenName, _tokenSymbol) Ownable(msg.sender) {
    _mint(msg.sender, _supply * (1e18));
}

    /**
     * @dev Permette solo al proprietario del contratto di coniare (creare) nuovi token.
     * @param _amount La quantità di nuovi token da coniare (verrà moltiplicata per 10**18).
     */
    function mint(uint256 _amount) external onlyOwner {
        // Conia la quantità specificata e la assegna al proprietario (msg.sender)
        _mint(msg.sender, _amount * (1e18));
    
    }
}
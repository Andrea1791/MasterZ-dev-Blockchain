// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./GameItems.sol";

contract GameItemsFactory {
    address public immutable implementation;
    address[] public deployedGameSets;

    event GameSetCloned(address indexed cloneAddress, address indexed owner, string uri);

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function createGameSet(string memory uri) public returns (address) {
        address cloneAddress = Clones.clone(implementation);
        GameItems(cloneAddress).initialize(uri, msg.sender);

        deployedGameSets.push(cloneAddress);
        emit GameSetCloned(cloneAddress, msg.sender, uri);
        return cloneAddress;
    }
}
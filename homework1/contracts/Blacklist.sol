// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Blacklist is Ownable {
    mapping(address => bool) private _blacklisted;

constructor() Ownable(msg.sender) {}

function setBlacklist(address[] calldata array) external onlyOwner {
    for (uint256 i = 0; i < array.length; i++) {
        _blacklisted[array[i]] = true;
    }
}
function resetBlacklist(address[] calldata array) external onlyOwner {
    for (uint256 i = 0; i < array.length; i++) {
        _blacklisted[array[i]] = false;
    }
}

function isBlacklisted(address account) external view returns (bool) {
    return _blacklisted[account];
}
}
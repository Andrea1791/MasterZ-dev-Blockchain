
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract GameItems is Initializable, ERC1155Upgradeable, OwnableUpgradeable {
    
    uint256 public constant GOLD_COIN = 0;
    uint256 public constant LEGENDARY_SWORD = 1;
    uint256 public constant VALOROUS_SWORD = 2;
    uint256 public constant HERO_SWORD = 3;
    uint256 public constant COMMON_SWORD = 4;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory uri, address initialOwner) public initializer {
        __ERC1155_init(uri);
        __Ownable_init(initialOwner);
        
        _mint(initialOwner, GOLD_COIN, 1000, "");
        _mint(initialOwner, LEGENDARY_SWORD, 1, "");
        _mint(initialOwner, VALOROUS_SWORD, 1, "");
        _mint(initialOwner, HERO_SWORD, 1, "");
        _mint(initialOwner, COMMON_SWORD, 1, "");
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBlacklist.sol";


contract Token is ERC20, Ownable {
   // uint8 public _decimals = 18;
    address public blAddress;



    constructor(string memory name, string memory symbol, address blAddress_) ERC20(name, symbol) Ownable(_msgSender()) {
        blAddress = blAddress_;
        //decimals();
    }
    
    function decimals() public view virtual override returns (uint8) {
        return 18; // Standard for ERC20 tokens
    }
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
        
    }

    function transfer(address from, address to, uint256 amount) internal virtual  {
        require(to != address(0), "ERC20: transfer to the zero address");
        require(from != address(0), "ERC20: transfer from the zero address");
        super._transfer(from, to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal view  {
        amount;
        if(IBlacklist(blAddress).isBlacklisted(to) || IBlacklist(blAddress).isBlacklisted(from)) {
            revert("Transfer not allowed: address is blacklisted");
        }

    }}

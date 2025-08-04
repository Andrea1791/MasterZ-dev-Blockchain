//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./AggregatorV3Interface.sol"; // CAMBIATO: import locale
import "@openzeppelin/contracts/access/Ownable.sol";

// (Remove duplicate contract declaration and constructor)
contract Collector is Ownable {

    error noEthDeposit(); // ✅ CORRETTO: era noEthDeposited()
    error noEthToWithdraw();
    error noEthSent();

    uint public constant usdDecimals = 2;
    uint public ownerEthAmountToWithdraw;

    address public oracleEthUsdPrice;
    AggregatorV3Interface public ethUsdPrice;

    mapping(address => uint256) public userEthDeposits; // ✅ CORRETTO: rimosso "amount"

    constructor(address clEthUsd) {
        oracleEthUsdPrice = clEthUsd;
        ethUsdPrice = AggregatorV3Interface(oracleEthUsdPrice);
    }

    function getLatestEthUsdPrice() public view returns (int) {
        (, int price, , , ) = ethUsdPrice.latestRoundData();
        return price;
    }

    receive() external payable {
        registerUserDeposit(msg.sender);
    }

    function registerUserDeposit(address user) internal {
        if (msg.value == 0) revert noEthSent();
        userEthDeposits[user] += msg.value;
    }

    function getPriceDecimals() public view returns (uint) {
        return uint(ethUsdPrice.decimals());
    }

    function convertEthInUSD(address user) public view returns (uint) {
        uint userUSDDeposit = 0;
        if (userEthDeposits[user] > 0) {
            uint ethPriceDecimals = getPriceDecimals();
            uint ethPrice = uint(getLatestEthUsdPrice());
            uint divDecs = 18 + ethPriceDecimals - usdDecimals;
            userUSDDeposit = userEthDeposits[user] * ethPrice / (10 ** divDecs);
        }
        return userUSDDeposit;
    }

    function convertUSDInETH(uint usdAmount) public view returns (uint) {
        uint convertAmountInEth = 0;
        if (usdAmount > 0) {
            uint ethPriceDecimals = getPriceDecimals();
            uint ethPrice = uint(getLatestEthUsdPrice());
            uint mulDecs = 18 + ethPriceDecimals - usdDecimals;
            convertAmountInEth = usdAmount * (10 ** mulDecs) / ethPrice;
        }
        return convertAmountInEth;
    }

    function getNativeCoinsBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function userETHWithdraw() external {
        if(userEthDeposits[msg.sender] == 0) {
            revert noEthDeposit(); // ✅ CORRETTO: era noEthDeposited()
        }

        uint tempValue = userEthDeposits[msg.sender];
        userEthDeposits[msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: tempValue}(""); // ✅ CORRETTO: era msgSender()
        if (!sent) {
            revert noEthSent();
        }
    }
}
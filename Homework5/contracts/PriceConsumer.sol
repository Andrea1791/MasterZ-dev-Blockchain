// Incolla questo ESATTAMENTE nel file contracts/PriceConsumer.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // VERSIONE CORRETTA

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


contract PriceConsumer { 
    AggregatorV3Interface internal priceFeed;

    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function getLatestPrice() public view returns (int) {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }

    function getPriceDecimals() public view returns (uint8) {
        return priceFeed.decimals();
    }
}
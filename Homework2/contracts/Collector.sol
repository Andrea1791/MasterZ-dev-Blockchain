//SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

// QUESTA È LA RIGA CORRETTA
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//import"@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Collector is Ownable {

    error noEthDeposit();
    error noEthToWithdraw();
    error noEthSent();

    uint public constant usdDecimals = 2;
    uint public ownerEthAmountToWithdraw;

    address public oracleEthUsdPrice;

    AggregatorV3Interface public ethUsdPrice;

    mapping(address => uint256 amount) public userEthDeposits;

    //     Network: ETH Mainnet
    //     Aggregator: ETH/USD
    //     Address: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419



    constructor(address clEthUsd) {
        oracleEthUsdPrice = clEthUsd;

        ethUsdPrice = AggregatorV3Interface(oracleEthUsdPrice);
    }

    function getLatestEthUsdPrice() public view returns (int) {
        (
            , 
            int price, 
            , 
            , 
        ) = ethUsdPrice.latestRoundData();
        return price;
    }

receive() external payable {
    registerUserDeposit(msg.sender);
}


    function registerUserDeposit(address user) internal {
        if (msg.value == 0) revert noEthSent();
        userEthDeposits[user] += msg.value;
    }

    // ftrace | funcSig
function getPriceDecimals() public view returns (uint) {
    return uint(ethUsdPrice.decimals());
}

// ftrace | funcSig
function convertEthInUSD(address user) public view returns (uint) {
    uint userUSDDeposit = 0;
    if (userEthDeposits[user] > 0) {
        uint ethPriceDecimals = getPriceDecimals();
        uint ethPrice = uint(getLatestEthUsdPrice()); // scaled by 10^ethPriceDecimals (10^8)
        uint divDecs = 18 + ethPriceDecimals - usdDecimals;
        userUSDDeposit = userEthDeposits[user] * ethPrice / (10 ** divDecs); // scaled by 10^26 / 10^24 = 10^2
    }
    return userUSDDeposit;
}

// ftrace | funcSig
function convertUSDInETH(uint usdAmount) public view returns (uint) {
    uint convertAmountInEth = 0;
    if (usdAmount > 0) {
        uint ethPriceDecimals = getPriceDecimals();
        uint ethPrice = uint(getLatestEthUsdPrice()); // scaled by 10^ethPriceDecimals (10^8)
        uint mulDecs = 18 + ethPriceDecimals - usdDecimals;
        convertAmountInEth = usdAmount * (10 ** mulDecs) / ethPrice; // scaled by 10^26 / 10^8 = 10^18
    }
    return convertAmountInEth;
    }

    /** this balance in native coins and tokens */
// ftrace | funcSig
function getNativeCoinsBalance() external view returns (uint256) {
    return address(this).balance;
}

/** Withdraws */
function userETHWithdraw() external {
    //require(userEthDeposits[msg.sender] > 0, "no eth to withdraw");
     if(userEthDeposits[msg.sender] == 0) {
         revert noEthDeposited();
     }

    uint tempValue = userEthDeposits[msg.sender];
    userEthDeposits[msg.sender] = 0;

    (bool sent, ) = payable(msgSender()).call{value: tempValue}("");
    if (!sent) {
        revert noEthSent();
    }
}
}
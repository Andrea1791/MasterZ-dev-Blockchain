// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PriceConsumer.sol";

contract SimpleDEX is Ownable {
    using SafeERC20 for IERC20;

    address public token;
    PriceConsumer public ethUsdContract;
    uint256 public ethPriceDecimals;
    uint256 public ethPrice;

    event Bought(uint256 amount);
    event Sold(uint256 amount);

    // --- RIGA MODIFICATA ---
    constructor(address _token, address oracleEthUSDPrice) Ownable(msg.sender) {
        token = _token;
        ethUsdContract = new PriceConsumer(oracleEthUSDPrice);
    }

    function getCLParameters() public {
        ethPriceDecimals = ethUsdContract.getPriceDecimals();
        ethPrice = uint256(ethUsdContract.getLatestPrice());
    }

    function buyToken() public payable {
        require(msg.value > 0, "You need to send some ether");
        uint256 dexBalance = IERC20(token).balanceOf(address(this));

        getCLParameters();

        uint256 amountToSend = msg.value * ethPrice / (10 ** ethPriceDecimals);

        require(amountToSend <= dexBalance, "Not enough tokens in the reserve");
        IERC20(token).safeTransfer(msg.sender, amountToSend);

        emit Bought(amountToSend);
    }

    function sellToken(uint256 amount) public {
        require(amount > 0, "You need to sell at least some tokens");
        uint256 allowance = IERC20(token).allowance(msg.sender, address(this));
        require(allowance >= amount, "Check the token allowance");

        getCLParameters();

        uint256 amountToSend = amount * (10 ** ethPriceDecimals) / ethPrice;

        require(address(this).balance >= amountToSend, "Not enough ethers in the reserve");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        payable(msg.sender).transfer(amountToSend);

        emit Sold(amount);
    }

    receive() external payable {}
}
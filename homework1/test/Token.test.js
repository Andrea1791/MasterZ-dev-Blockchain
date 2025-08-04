const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { ZERO_ADDRESS } = constants;

//const chai = require("chai");
//chai.use(require("chai-as-promised"));
//const { expect } = chai;
import("chai")

const Blacklist = artifacts.require("Blacklist");
const Token = artifacts.require("Token");

let blacklist, token;

contract("Token", async (accounts) => {
    const [owner, account1, account2, account3] = accounts;

    it("check if the contract is deployed", async () => {
        console.log("owner address:", owner);
        blacklist = await Blacklist.deployed();
        expect(blacklist.address).to.not.equal(ZERO_ADDRESS);
        console.log("Blacklist deployed at:", blacklist.address);

         token = await Token.deployed();
        expect(token.address).to.not.equal(ZERO_ADDRESS);
        
        console.log("Token address:", token.address);
        expect(owner).to.equal(await token.owner());
    })

    it("set blacklist", async () => {
      
        await blacklist.setBlacklist([account3]);
        
        expect(await blacklist.isBlacklisted(account3)).to.equal(true);
        
    })
    
    it("mint ok", async () => {
       
        await token.mint(account1, web3.utils.toWei('100'), { from: owner });
        
        expect(web3.utils.fromWei (await token.balanceOf(account1))).to.equal('100');
    
    });

    it("mint not ok", async () => {
        await expectRevert(token.mint(account3, web3.utils.toWei('100'), { from: owner }),
            "Transfer not allowed: address is blacklisted"
        );
    })
    it("transfer ok", async () => {
        await token.transfer(account2, web3.utils.toWei('50'), { from: account1 });

        expect(web3.utils.fromWei(await token.balanceOf(account1))).to.equal('50');
        
        expect(web3.utils.fromWei(await token.balanceOf(account2))).to.equal('50');
    });

    it("transfer not ok", async () => {
        await expectRevert(token.transfer(account3, web3.utils.toWei('10'), { from: account1 }),
            "Transfer not allowed: address is blacklisted");
    });
});

const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("Market", function () {
  let usdt, market, myNft, account1, account2;
  let baseURI = "https://sample.com/";

  // define fixture function to deploy contracts and initialize state
  async function deployMarketFixture() {
    const [account1, account2] = await ethers.getSigners();

    // deploy USDT contract
    const USDT = await ethers.getContractFactory("USDT");
    const usdt = await USDT.deploy();

    // deploy MyNFT contract
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNft = await MyNFT.deploy();

    // deploy Market contract
    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy(usdt.target, myNft.target);

    // account1 mint 2 NFT
    await myNft.safeMint(account1.address, baseURI + "0");
    await myNft.safeMint(account1.address, baseURI + "1");

    // account1 approve Market contract to spend NFT
    await myNft.approve(market.target, 0);
    await myNft.approve(market.target, 1);

    // account1 transfer 10000 USDT to account2
    await usdt.transfer(account2.address, "10000000000000000000000");

    // account2 approve Market contract to spend USDT
    await usdt
      .connect(account2)
      .approve(market.target, "1000000000000000000000000");

    return { usdt, market, myNft, account1, account2 };
  }

  describe("Deployment", function () {
    it("should set the correct ERC20 address", async function () {
      const { market, usdt } = await loadFixture(deployMarketFixture);
      expect(await market.erc20()).to.equal(usdt.target);
    });

    it("should set the correct ERC721 address", async function () {
      const { market, myNft } = await loadFixture(deployMarketFixture);
      expect(await market.erc721()).to.equal(myNft.target);
    });

    it("account1 should have 2 NFTs", async function () {
      const { myNft, account1 } = await loadFixture(deployMarketFixture);
      expect(await myNft.balanceOf(account1.address)).to.equal(2);
    });

    it("account2 should have 10000 USDT", async function () {
      const { usdt, account2 } = await loadFixture(deployMarketFixture);
      expect(await usdt.balanceOf(account2.address)).to.equal(
        "10000000000000000000000"
      );
    });

    it("account2 should have 0 NFTs", async function () {
      const { myNft, account2 } = await loadFixture(deployMarketFixture);
      expect(await myNft.balanceOf(account2.address)).to.equal(0);
    });
  });

  describe("Listing NFTs", function () {
    it("account1 can list two NFTs to market", async function () {
      const { market, myNft, account1 } = await loadFixture(
        deployMarketFixture
      );
      const price =
        "0x0000000000000000000000000000000000000000000000000001c6bf52634000";

      // check if the "NewOrder" event is emitted when the first NFT is listed
      await expect(
        myNft["safeTransferFrom(address,address,uint256,bytes)"](
          account1.address,
          market.target,
          0,
          price
        )
      )
        .to.emit(market, "NewOrder")
        .withArgs(account1.address, 0, price);

      // check if the "NewOrder" event is emitted when the second NFT is listed
      await expect(
        myNft["safeTransferFrom(address,address,uint256,bytes)"](
          account1.address,
          market.target,
          1,
          price
        )
      )
        .to.emit(market, "NewOrder")
        .withArgs(account1.address, 1, price);

      expect(await myNft.balanceOf(account1.address)).to.equal(0);
      expect(await myNft.balanceOf(market.target)).to.equal(2);
      expect(await market.isListed(0)).to.equal(true);
      expect(await market.isListed(1)).to.equal(true);

      const allNFTs = await market.getAllNFTs();
      expect(allNFTs[0].seller).to.equal(account1.address);
      expect(allNFTs[0].tokenId).to.equal(0);
      expect(allNFTs[0].price).to.equal(price);
      expect(allNFTs[1].seller).to.equal(account1.address);
      expect(allNFTs[1].tokenId).to.equal(1);
      expect(allNFTs[1].price).to.equal(price);

      expect(await market.getOrderLength()).to.equal(2);

      const myNFTs = await market.getMyNFTs();
      expect(myNFTs[0].seller).to.equal(account1.address);
      expect(myNFTs[0].tokenId).to.equal(0);
      expect(myNFTs[0].price).to.equal(price);
    });
  });

  describe("Unlisting NFTs", function () {
    it("account1 can unlist one NFT from market", async function () {
      const { market, myNft, account1 } = await loadFixture(
        deployMarketFixture
      );
      const price =
        "0x0000000000000000000000000000000000000000000000000001c6bf52634000";

      // list 2 NFT
      await myNft["safeTransferFrom(address,address,uint256,bytes)"](
        account1.address,
        market.target,
        0,
        price
      );
      await myNft["safeTransferFrom(address,address,uint256,bytes)"](
        account1.address,
        market.target,
        1,
        price
      );

      // cancel the first NFT
      await expect(market.cancelOrder(0))
        .to.emit(market, "CancelOrder")
        .withArgs(account1.address, 0);

      expect(await market.getOrderLength()).to.equal(1);
      expect(await market.isListed(0)).to.equal(false);

      const myNFTs = await market.getMyNFTs();
      expect(myNFTs.length).to.equal(1);
    });
  });

  describe("Changing Price", function () {
    it("account1 can change the price of an NFT", async function () {
      const { market, myNft, account1 } = await loadFixture(
        deployMarketFixture
      );
      const price =
        "0x0000000000000000000000000000000000000000000000000001c6bf52634000";

      // list 2 NFT
      await myNft["safeTransferFrom(address,address,uint256,bytes)"](
        account1.address,
        market.target,
        0,
        price
      );
      await myNft["safeTransferFrom(address,address,uint256,bytes)"](
        account1.address,
        market.target,
        1,
        price
      );

      // change the price
      const newPrice = "10000000000000000000000";
      await expect(market.changePrice(1, newPrice))
        .to.emit(market, "ChangePrice")
        .withArgs(account1.address, 1, price, newPrice);

      const myNFTs = await market.getMyNFTs();
      expect(myNFTs[1].price).to.equal(newPrice);
    });
  });

  describe("Buying NFTs", function () {
    it("account2 can buy an NFT from market", async function () {
      const { market, myNft, usdt, account1, account2 } = await loadFixture(
        deployMarketFixture
      );
      const price =
        "0x0000000000000000000000000000000000000000000000000001c6bf52634000";

      await myNft["safeTransferFrom(address,address,uint256,bytes)"](
        account1.address,
        market.target,
        0,
        price
      );
      await myNft["safeTransferFrom(address,address,uint256,bytes)"](
        account1.address,
        market.target,
        1,
        price
      );

      // account2 buy the second NFT
      await expect(market.connect(account2).buy(1))
        .to.emit(market, "Deal")
        .withArgs(account2.address, account1.address, 1, price);

      expect(await market.getOrderLength()).to.equal(1);

      expect(await usdt.balanceOf(account1.address)).to.equal(
        "99990000000500000000000000"
      );
      expect(await usdt.balanceOf(account2.address)).to.equal(
        "9999999500000000000000"
      );

      expect(await myNft.ownerOf(1)).to.equal(account2.address);
    });
  });
});

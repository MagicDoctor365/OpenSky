const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const USDTFactory = await ethers.getContractFactory("USDT");
  const MyNFTFactory = await ethers.getContractFactory("MyNFT");
  const MarketFactory = await ethers.getContractFactory("Market");

  const USDT = await USDTFactory.deploy();
  const MyNFT = await MyNFTFactory.deploy();
  const Market = await MarketFactory.deploy(USDT.address, MyNFT.address);
  console.log("USDT Contract deployed to:", USDT.address);
  console.log("MyNFT Contract deployed to:", MyNFT.address);
  console.log("Market Contract deployed to:", Market.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

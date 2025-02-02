const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const USDTFactory = await ethers.getContractFactory("USDT");
  const USDT = await USDTFactory.deploy();
  console.log("USDT Contract deployed to:", USDT.target);

  const MyNFTFactory = await ethers.getContractFactory("MyNFT");
  const MyNFT = await MyNFTFactory.deploy();
  console.log("MyNFT Contract deployed to:", MyNFT.target);

  const MarketFactory = await ethers.getContractFactory("Market");
  const Market = await MarketFactory.deploy(USDT.target, MyNFT.target);
  console.log("Market Contract deployed to:", Market.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

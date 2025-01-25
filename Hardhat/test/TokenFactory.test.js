const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token and TokenFactory contracts", function () {
  let TokenFactory, tokenFactory, Token, owner, addr1;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();

    TokenFactory = await ethers.getContractFactory("TokenFactory");
    tokenFactory = await TokenFactory.deploy();
    await tokenFactory.deployed();
  });

  it("should create a new token and emit the TokenCreated event", async () => {
    const initialSupply = 1000; // 直接以整数表示初始供应量
    const tokenName = "MyToken";
    const tokenSymbol = "MTK";

    const tx = await tokenFactory.createToken(
      addr1.address,
      initialSupply,
      tokenName,
      tokenSymbol
    );
    const receipt = await tx.wait();

    const event = receipt.events.find((e) => e.event === "TokenCreated");
    expect(event).to.not.be.undefined;

    const tokenAddress = event.args.tokenAddress;
    expect(event.args.owner).to.equal(addr1.address);
    expect(event.args.initialSupply.toString()).to.equal(
      initialSupply.toString()
    );
    expect(event.args.name).to.equal(tokenName);
    expect(event.args.symbol).to.equal(tokenSymbol);

    Token = await ethers.getContractFactory("Token");
    const token = Token.attach(tokenAddress);

    expect(await token.name()).to.equal(tokenName);
    expect(await token.symbol()).to.equal(tokenSymbol);

    // 这里验证时记得单位转换，因为合约中的逻辑仍然使用了 `10 ** 18`
    const expectedSupply = ethers.utils.parseEther(initialSupply.toString());
    expect((await token.totalSupply()).toString()).to.equal(
      expectedSupply.toString()
    );
    expect((await token.balanceOf(addr1.address)).toString()).to.equal(
      expectedSupply.toString()
    );
  });

  it("should allow multiple tokens to be created", async () => {
    const initialSupply = 500; // 初始供应量为整数
    const token1Name = "Token1";
    const token1Symbol = "TK1";
    const token2Name = "Token2";
    const token2Symbol = "TK2";

    const tx1 = await tokenFactory.createToken(
      addr1.address,
      initialSupply,
      token1Name,
      token1Symbol
    );
    const receipt1 = await tx1.wait();
    const token1Address = receipt1.events.find(
      (e) => e.event === "TokenCreated"
    ).args.tokenAddress;

    const tx2 = await tokenFactory.createToken(
      addr1.address,
      initialSupply,
      token2Name,
      token2Symbol
    );
    const receipt2 = await tx2.wait();
    const token2Address = receipt2.events.find(
      (e) => e.event === "TokenCreated"
    ).args.tokenAddress;

    const token1 = Token.attach(token1Address);
    expect(await token1.name()).to.equal(token1Name);
    expect(await token1.symbol()).to.equal(token1Symbol);

    const expectedSupply1 = ethers.utils.parseEther(initialSupply.toString());
    expect((await token1.totalSupply()).toString()).to.equal(
      expectedSupply1.toString()
    );

    const token2 = Token.attach(token2Address);
    expect(await token2.name()).to.equal(token2Name);
    expect(await token2.symbol()).to.equal(token2Symbol);

    const expectedSupply2 = ethers.utils.parseEther(initialSupply.toString());
    expect((await token2.totalSupply()).toString()).to.equal(
      expectedSupply2.toString()
    );
  });
});

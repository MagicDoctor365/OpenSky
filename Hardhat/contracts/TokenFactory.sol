// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    constructor(address initialOwner, uint256 initialSupply, string memory name, string memory symbol)
        ERC20(name, symbol)
        Ownable(initialOwner)
 {
        _transferOwnership(initialOwner);
        _mint(initialOwner, initialSupply * 10 ** 18);

 }
}


contract TokenFactory {
    event TokenCreated(address indexed tokenAddress, address indexed owner, uint256 initialSupply, string name, string symbol);

    function createToken(address initialOwner, uint256 initialSupply, string memory name, string memory symbol) public returns (address) {
    
        Token newToken = new Token(initialOwner, initialSupply, name, symbol);
        emit TokenCreated(address(newToken), initialOwner, initialSupply, name, symbol);
        return address(newToken);
        
    }
}

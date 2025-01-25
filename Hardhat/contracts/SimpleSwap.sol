// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleSwap is ERC20 {

    // token contracts
    IERC20 public token0;
    IERC20 public token1;

    // token reserves
    uint public reserve0;
    uint public reserve1;

    // events
    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1);
    event Swap(address indexed sender, uint amountIn, address tokenIn, uint amountOut, address tokenOut);

    constructor(IERC20 _token0, IERC20 _token1) ERC20("SimpleSwap", "SS") {
        token0 = _token0;
        token1 = _token1;
    }

    function min(uint x, uint y) internal pure returns (uint z) {
        z = x < y ? x : y;
    }

    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function addLiquidity(uint amount0Desired, uint amount1Desired) public returns (uint liquidity) {
        // add the liquidity to SimpleSwap contract
        token0.transferFrom(msg.sender, address(this), amount0Desired);
        token1.transferFrom(msg.sender, address(this), amount1Desired);

        // compute liquidity
        uint _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            liquidity = sqrt(amount0Desired * amount1Desired);
        } else {
            liquidity = min(
                (amount0Desired * _totalSupply) / reserve0,
                (amount1Desired * _totalSupply) / reserve1
            );
        }

        // check the amount of minted LP
        require(liquidity > 0, "SimpleSwap: insufficient liquidity");

        // update reserves
        reserve0 = token0.balanceOf(address(this));
        reserve1 = token1.balanceOf(address(this));

        // mint LP tokens
        _mint(msg.sender, liquidity);

        emit Mint(msg.sender, amount0Desired, amount1Desired);
    }


    function removeLiquidity(uint liquidity) public returns (uint amount0, uint amount1) {
        // get balances
        uint balance0 = token0.balanceOf(address(this));
        uint balance1 = token1.balanceOf(address(this));

        // compute the token amount based on the LP proportion
        uint _totalSupply = totalSupply();
        amount0 = (liquidity * balance0) / _totalSupply;
        amount1 = (liquidity * balance1) / _totalSupply;

        // check the amount of tokens
        require(amount0 > 0 && amount1 > 0, "Insufficient liquidity");

        // burn LP tokens
        _burn(msg.sender, liquidity);

        // transfer tokens
        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);

        // update reserves
        reserve0 = token0.balanceOf(address(this));
        reserve1 = token1.balanceOf(address(this));

        emit Burn(msg.sender, amount0, amount1);
    }

    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        amountOut = (amountIn * reserveOut) / (reserveIn + amountIn);
    }

    function swap(uint amountIn, IERC20 tokenIn, uint amountOutMin) public returns (uint amountOut, IERC20 tokenOut) {
        require(amountIn > 0, "Insufficient input amount");
        require(tokenIn == token0 || tokenIn == token1, "Invalid token");

        uint balance0 = token0.balanceOf(address(this));
        uint balance1 = token1.balanceOf(address(this));

        if (tokenIn == token0) {
            tokenOut = token1;
            amountOut = getAmountOut(amountIn, balance0, balance1);

            require(amountOut > amountOutMin, "Insufficient output amount");

            tokenIn.transferFrom(msg.sender, address(this), amountIn);
            tokenOut.transfer(msg.sender, amountOut);
        } else {
            tokenOut = token0;
            amountOut = getAmountOut(amountIn, balance1, balance0);

            require(amountOut > amountOutMin, "Insufficient output amount");

            tokenIn.transferFrom(msg.sender, address(this), amountIn);
            tokenOut.transfer(msg.sender, amountOut);
        }

        // update reserves
        reserve0 = token0.balanceOf(address(this));
        reserve1 = token1.balanceOf(address(this));

        emit Swap(msg.sender, amountIn, address(tokenIn), amountOut, address(tokenOut));

    }
}
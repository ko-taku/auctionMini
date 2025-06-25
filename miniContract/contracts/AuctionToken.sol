// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuctionToken is ERC20, Ownable {
    constructor() ERC20("AuctionToken", "ACTK") Ownable(msg.sender) {
        _mint(msg.sender, 10_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

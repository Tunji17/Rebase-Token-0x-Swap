// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
  constructor() ERC20("Mock Token", "MKT") {
    _mint(msg.sender, 1e9 * (10**decimals()));
  }
}

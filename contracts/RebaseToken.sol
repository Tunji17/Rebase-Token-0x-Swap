// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RebaseToken is ERC20, Ownable {
    uint256 private rebaseRatio = 1e9;
    mapping(address => uint256) private _balances;
    uint256 private _totalSupply;

    event Rebase(uint256 newSupply, uint256 oldSupply);

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, 1e9 * (10**decimals()));
    }


    function rebase(int256 percentage) public onlyOwner {
        require(percentage != 0, "Percentage cannot be 0");
        require(percentage > -100, "Percentage cannot be less than -100");

        if (percentage < 0) {
            rebaseRatio = (rebaseRatio * (100 - uint256(-percentage))) / 100;
        } else {
            rebaseRatio = (rebaseRatio * (100 + uint256(percentage))) / 100;
        }
    }

    function getRebaseRatio() public view returns (uint256) {
        return rebaseRatio;
    }

    function setRebaseRatio(uint256 _rebaseRatio) public onlyOwner returns (bool success) {
        rebaseRatio = _rebaseRatio;
        return true;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply / rebaseRatio;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account] / rebaseRatio;
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        // calculate rebased amount
        uint256 _amount = amount * rebaseRatio;

        uint256 fromBalance = _balances[from];
        require(
            fromBalance >= _amount,
            "ERC20: transfer amount exceeds balance"
        );
        unchecked {
            _balances[from] = fromBalance - _amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
            // decrementing then incrementing.
            _balances[to] += _amount;
        }

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal override {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        // calculate rebased amount
        uint256 _amount = amount * rebaseRatio;

        _totalSupply += _amount;
        unchecked {
            // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
            _balances[account] += _amount;
        }
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal override {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        // calculate rebased amount
        uint256 _amount = amount * rebaseRatio;

        uint256 accountBalance = _balances[account];
        require(
            accountBalance >= _amount,
            "ERC20: burn amount exceeds balance"
        );
        unchecked {
            _balances[account] = accountBalance - _amount;
            // Overflow not possible: amount <= accountBalance <= totalSupply.
            _totalSupply -= _amount;
        }

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }
}
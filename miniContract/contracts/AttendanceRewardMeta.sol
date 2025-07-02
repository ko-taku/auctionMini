// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EngageToken.sol";
import "./AuctionToken.sol";

contract AttendanceRewardMeta is ERC2771Context, Ownable {
    mapping(address => uint256) public lastClaimedDayEngage;
    mapping(address => uint256) public lastClaimedDayAuction;

    uint256 public rewardAmount = 100 * 10 ** 18;

    EngageToken public engageToken;
    AuctionToken public auctionToken;

    address private _trustedForwarder;

    constructor(
        address _engageToken,
        address _auctionToken,
        address forwarder
    ) ERC2771Context(forwarder) Ownable(msg.sender) {
        engageToken = EngageToken(_engageToken);
        auctionToken = AuctionToken(_auctionToken);
        _trustedForwarder = forwarder;
    }

    function isTrustedForwarder(
        address forwarder
    ) public view override returns (bool) {
        return forwarder == _trustedForwarder;
    }

    function _today() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function claimEngage() external {
        address user = _msgSender();

        uint256 today = _today();
        require(
            lastClaimedDayEngage[user] < today,
            "EngageToken already claimed today"
        );

        lastClaimedDayEngage[user] = today;

        bool success = engageToken.transferFrom(owner(), user, rewardAmount);
        require(success, "EngageToken transfer failed");
    }

    function claimAuction() external {
        address user = _msgSender();

        uint256 today = _today();
        require(
            lastClaimedDayAuction[user] < today,
            "AuctionToken already claimed today"
        );

        lastClaimedDayAuction[user] = today;

        bool success = auctionToken.transferFrom(owner(), user, rewardAmount);
        require(success, "AuctionToken transfer failed");
    }

    function setRewardAmount(uint256 newAmount) external onlyOwner {
        rewardAmount = newAmount;
    }

    /**
     * Required overrides because Context is inherited multiple times (via ERC2771Context, Ownable)
     */
    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address sender)
    {
        return ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength()
        internal
        view
        override(Context, ERC2771Context)
        returns (uint256)
    {
        return ERC2771Context._contextSuffixLength();
    }
}

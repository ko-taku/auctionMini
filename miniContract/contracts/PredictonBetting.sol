// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IAuctionManager {
    function auctions(
        uint256 auctionId
    )
        external
        view
        returns (
            address,
            address,
            uint256,
            uint256,
            uint256,
            uint256,
            address,
            uint256,
            bool
        );

    function nextAuctionId() external view returns (uint256);
}

interface ICustomVRF {
    function requestRandomness(
        address callbackTarget,
        address recipient,
        uint256 min,
        uint256 max
    ) external returns (uint256);
}

interface IRandomRewardReceiver {
    function receiveReward(
        uint256 requestId,
        address recipient,
        uint256 reward
    ) external;
}

contract PredictionBetting is ERC2771Context, Ownable, IRandomRewardReceiver {
    IERC20 public engageToken;
    IERC20 public auctionToken;
    IAuctionManager public auctionManager;
    ICustomVRF public customVRF;

    enum Tier {
        NONE,
        TIER10,
        TIER50,
        TIER100
    }

    struct Bet {
        address bettor;
        uint256 predictedPrice;
        Tier tier;
    }

    struct RewardRequestInfo {
        uint256 auctionId;
        address recipient;
        Tier tier;
    }

    mapping(uint256 => Bet[]) public auctionBets;
    mapping(uint256 => mapping(address => bool)) public hasBet;
    mapping(uint256 => address[]) public winners;
    mapping(uint256 => Tier) public winnerTier;
    mapping(uint256 => RewardRequestInfo) public rewardRequestInfo;
    mapping(uint256 => mapping(address => bool)) public rewardClaimed;

    uint256[] public currentBettableAuctions;
    mapping(uint256 => bool) public isBettableAuction;

    constructor(
        address _engageToken,
        address _auctionToken,
        address _auctionManager,
        address _customVRF,
        address _trustedForwarder
    ) ERC2771Context(_trustedForwarder) Ownable(_msgSender()) {
        engageToken = IERC20(_engageToken);
        auctionToken = IERC20(_auctionToken);
        auctionManager = IAuctionManager(_auctionManager);
        customVRF = ICustomVRF(_customVRF);
    }

    function placeBet(
        uint256 auctionId,
        uint256 predictedPrice,
        Tier tier
    ) external {
        require(isBettableAuction[auctionId], "Not registered for betting");
        require(
            tier == Tier.TIER10 || tier == Tier.TIER50 || tier == Tier.TIER100,
            "Invalid tier"
        );
        require(!hasBet[auctionId][_msgSender()], "Already bet");

        (, , , , , , , uint256 endTime, bool active) = auctionManager.auctions(
            auctionId
        );
        require(active, "Auction inactive");
        require(block.timestamp + 3 hours < endTime, "Too late to bet");

        uint256 amount = (tier == Tier.TIER10)
            ? 10 ether
            : (tier == Tier.TIER50)
                ? 50 ether
                : 100 ether;

        engageToken.transferFrom(_msgSender(), address(this), amount);
        auctionBets[auctionId].push(Bet(_msgSender(), predictedPrice, tier));
        hasBet[auctionId][_msgSender()] = true;
    }

    function resolveWinners(uint256 auctionId) external onlyOwner {
        require(winners[auctionId].length == 0, "Already resolved");

        Bet[] storage bets = auctionBets[auctionId];
        require(bets.length > 0, "No bets");

        (, , , , , uint256 highestBid, , , ) = auctionManager.auctions(
            auctionId
        );
        uint256 closestDiff = type(uint256).max;

        for (uint i = 0; i < bets.length; i++) {
            uint256 diff = _absDiff(bets[i].predictedPrice, highestBid);
            if (diff < closestDiff) {
                closestDiff = diff;
            }
        }

        Tier referenceTier;
        for (uint i = 0; i < bets.length; i++) {
            uint256 diff = _absDiff(bets[i].predictedPrice, highestBid);
            if (diff == closestDiff) {
                winners[auctionId].push(bets[i].bettor);
                referenceTier = bets[i].tier;
            }
        }
        winnerTier[auctionId] = referenceTier;

        for (uint i = 0; i < winners[auctionId].length; i++) {
            address recipient = winners[auctionId][i];
            uint256 min = 1;
            uint256 max = (referenceTier == Tier.TIER10)
                ? 10
                : (referenceTier == Tier.TIER50)
                    ? 100
                    : 1000;

            uint256 requestId = customVRF.requestRandomness(
                address(this),
                recipient,
                min,
                max
            );

            rewardRequestInfo[requestId] = RewardRequestInfo({
                auctionId: auctionId,
                recipient: recipient,
                tier: referenceTier
            });
        }
    }

    function receiveReward(
        uint256 requestId,
        address recipient,
        uint256 reward
    ) external override {
        require(_msgSender() == address(customVRF), "Only VRF");

        RewardRequestInfo memory info = rewardRequestInfo[requestId];
        require(info.recipient == recipient, "Invalid recipient");
        require(!rewardClaimed[info.auctionId][recipient], "Already rewarded");

        rewardClaimed[info.auctionId][recipient] = true;
        auctionToken.transfer(recipient, reward);
    }

    function registerBettableAuctions(
        uint256[] calldata auctionIds
    ) external onlyOwner {
        for (uint i = 0; i < currentBettableAuctions.length; i++) {
            isBettableAuction[currentBettableAuctions[i]] = false;
        }
        delete currentBettableAuctions;

        for (uint i = 0; i < auctionIds.length; i++) {
            isBettableAuction[auctionIds[i]] = true;
            currentBettableAuctions.push(auctionIds[i]);
        }
    }

    function _absDiff(uint256 a, uint256 b) internal pure returns (uint256) {
        return (a > b) ? (a - b) : (b - a);
    }

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

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

interface IRandomRewardReceiver {
    function receiveReward(
        uint256 requestId,
        address recipient,
        uint256 reward
    ) external;
}

interface IRandomSubsetReceiver {
    function receiveRandomSubset(
        uint256 requestId,
        uint256[] calldata selected
    ) external;
}

contract CustomVRF is ERC2771Context, Ownable {
    uint256 public currentRequestId;
    address public trustedRelayer;

    struct RewardRequest {
        address recipient;
        uint256 min;
        uint256 max;
        address callbackTarget;
        bool fulfilled;
    }

    struct SubsetRequest {
        address requester;
        uint256[] candidates;
        uint8 count;
        address callbackTarget;
        bool fulfilled;
    }

    mapping(uint256 => RewardRequest) public rewardRequests;
    mapping(uint256 => SubsetRequest) public subsetRequests;

    event RandomRequested(
        uint256 indexed requestId,
        address indexed recipient,
        uint256 min,
        uint256 max,
        address indexed callbackTarget
    );
    event RandomFulfilled(
        uint256 indexed requestId,
        address indexed recipient,
        uint256 reward
    );
    event RandomSubsetRequested(
        uint256 indexed requestId,
        address indexed requester,
        uint8 count
    );
    event RandomSubsetFulfilled(uint256 indexed requestId, uint256[] selected);

    modifier onlyRelayer() {
        require(_msgSender() == trustedRelayer, "Not authorized relayer");
        _;
    }

    constructor(
        address forwarder
    ) ERC2771Context(forwarder) Ownable(_msgSender()) {}

    function setTrustedRelayer(address _relayer) external onlyOwner {
        trustedRelayer = _relayer;
    }

    // 보상용 랜덤 요청
    function requestRandomness(
        address callbackTarget,
        address recipient,
        uint256 min,
        uint256 max
    ) external returns (uint256) {
        require(callbackTarget != address(0), "Invalid callback");
        require(recipient != address(0), "Invalid recipient");
        require(max > min, "Invalid range");

        currentRequestId++;

        rewardRequests[currentRequestId] = RewardRequest({
            recipient: recipient,
            min: min,
            max: max,
            callbackTarget: callbackTarget,
            fulfilled: false
        });

        emit RandomRequested(
            currentRequestId,
            recipient,
            min,
            max,
            callbackTarget
        );
        return currentRequestId;
    }

    function fulfillRandomness(
        uint256 requestId,
        uint256 random
    ) external onlyRelayer {
        RewardRequest storage info = rewardRequests[requestId];
        require(!info.fulfilled, "Already fulfilled");

        info.fulfilled = true;

        uint256 reward = info.min + (random % (info.max - info.min + 1));

        IRandomRewardReceiver(info.callbackTarget).receiveReward(
            requestId,
            info.recipient,
            reward
        );

        emit RandomFulfilled(requestId, info.recipient, reward);
    }

    // 경매 랜덤 추첨 요청
    function requestRandomSubset(
        address callbackTarget,
        uint256[] calldata candidates,
        uint8 count
    ) external returns (uint256) {
        require(callbackTarget != address(0), "Invalid callback");
        require(count > 0 && count <= candidates.length, "Invalid count");

        currentRequestId++;

        subsetRequests[currentRequestId] = SubsetRequest({
            requester: _msgSender(),
            candidates: candidates,
            count: count,
            callbackTarget: callbackTarget,
            fulfilled: false
        });

        emit RandomSubsetRequested(currentRequestId, _msgSender(), count);
        return currentRequestId;
    }

    function fulfillRandomSubset(
        uint256 requestId,
        uint256 random
    ) external onlyRelayer {
        SubsetRequest storage req = subsetRequests[requestId];
        require(!req.fulfilled, "Already fulfilled");

        req.fulfilled = true;

        uint256[] memory pool = req.candidates;
        uint256[] memory selected = new uint256[](req.count);

        for (uint256 i = 0; i < req.count; i++) {
            uint256 randIndex = random % pool.length;
            selected[i] = pool[randIndex];

            // Swap and pop
            pool[randIndex] = pool[pool.length - 1];
            assembly {
                mstore(pool, sub(mload(pool), 1))
            }

            // Reseed random
            random = uint256(keccak256(abi.encode(random, i)));
        }

        IRandomSubsetReceiver(req.callbackTarget).receiveRandomSubset(
            requestId,
            selected
        );

        emit RandomSubsetFulfilled(requestId, selected);
    }

    // Context 충돌 해결용 override
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

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuctionManager is ERC2771Context, Ownable {
    IERC20 public auctionToken;
    uint256 public feePercent = 5;
    uint256 public nextAuctionId;
    address public feeRecipient;

    struct Auction {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 startPrice;
        uint256 minIncrement;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool active;
    }

    mapping(uint256 => Auction) public auctions;

    //EVENTS
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address nftContract,
        uint256 tokenId
    );
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 amount
    );
    event AuctionCanceled(uint256 indexed auctionId);

    constructor(
        address _auctionToken,
        address _trustedForwarder,
        address _initialOwner
    ) ERC2771Context(_trustedForwarder) Ownable(_initialOwner) {
        auctionToken = IERC20(_auctionToken);
        feeRecipient = msg.sender;
    }

    // REQUIRED OVERRIDES
    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address sender)
    {
        sender = ERC2771Context._msgSender();
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

    //Create Auction(Escrow)
    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startPrice,
        uint256 minIncrement,
        uint256 duration
    ) external {
        address seller = _msgSender();

        require(
            IERC721(nftContract).ownerOf(tokenId) == address(this),
            "NFT not escrowed"
        );

        auctions[nextAuctionId] = Auction({
            seller: seller,
            nftContract: nftContract,
            tokenId: tokenId,
            startPrice: startPrice,
            minIncrement: minIncrement,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            active: true
        });

        emit AuctionCreated(nextAuctionId, seller, nftContract, tokenId);
        nextAuctionId++;
    }

    //Place Bid
    function bid(uint256 auctionId, uint256 amount) external {
        address bidder = _msgSender();
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction inactive");
        require(block.timestamp < auction.endTime, "Auction ended");

        uint256 minBid = (auction.highestBid == 0)
            ? auction.startPrice
            : auction.highestBid + auction.minIncrement;

        require(amount >= minBid, "Bid too low");

        //Transfer bid amount to contract
        auctionToken.transferFrom(bidder, address(this), amount);

        //Refund previous bidder
        if (auction.highestBidder != address(0)) {
            auctionToken.transfer(auction.highestBidder, auction.highestBid);
        }

        auction.highestBid = amount;
        auction.highestBidder = bidder;

        emit BidPlaced(auctionId, bidder, amount);
    }

    //EndAuction
    function endAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction inactive");
        require(block.timestamp >= auction.endTime, "Auction ongoing");

        auction.active = false;

        if (auction.highestBidder != address(0)) {
            //Handle payments
            uint256 feeAmount = (auction.highestBid * feePercent) / 100;
            uint256 sellerAmount = auction.highestBid - feeAmount;

            auctionToken.transfer(auction.seller, sellerAmount);
            auctionToken.transfer(feeRecipient, feeAmount);

            //Transfer NFT to winner
            IERC721(auction.nftContract).safeTransferFrom(
                address(this),
                auction.highestBidder,
                auction.tokenId
            );

            emit AuctionEnded(
                auctionId,
                auction.highestBidder,
                auction.highestBid
            );
        } else {
            //No bids, return NFT to seller
            IERC721(auction.nftContract).safeTransferFrom(
                address(this),
                auction.seller,
                auction.tokenId
            );

            emit AuctionCanceled(auctionId);
        }
    }

    //Cancel Auction(no bids)
    function cancelAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction inactive");
        require(auction.seller == _msgSender(), "Not seller");
        require(
            auction.highestBidder == address(0),
            "Cannot caancel after bids"
        );

        auction.active = false;

        //Return NFT
        IERC721(auction.nftContract).safeTransferFrom(
            address(this),
            auction.seller,
            auction.tokenId
        );

        emit AuctionCanceled(auctionId);
    }

    //onERC721Received (Escrow)
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    //Owner-only fee configuration
    function setFeePercent(uint256 newFee) external onlyOwner {
        require(newFee <= 20, "Max 20%");
        feePercent = newFee;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        feeRecipient = newRecipient;
    }
}

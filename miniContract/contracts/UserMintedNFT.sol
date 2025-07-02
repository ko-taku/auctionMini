// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UserMintedNFT is ERC721URIStorage, ERC2771Context, Ownable {
    uint256 private _nextTokenId = 1;
    address private immutable _trustedForwarder;

    uint256[] private _allTokenIds;

    event Minted(address indexed minter, uint256 tokenId, string uri);

    constructor(
        address forwarder
    )
        ERC721("UserNFT", "UNFT")
        ERC2771Context(forwarder)
        Ownable(_msgSender())
    {
        _trustedForwarder = forwarder;
    }

    //ERC2771Context는 이 forwarder를 신뢰할 수 있는지 확인해야 _msgSender()나 _msgData()를 올바르게 작동할 수 있다
    function isTrustedForwarder(
        address forwarder
    ) public view override returns (bool) {
        return forwarder == _trustedForwarder;
    }

    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address)
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

    // mint는 여전히 누구나 가능 (제한 안 걸면)
    function mint(string memory tokenURI) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(_msgSender(), tokenId); // 메타트랜잭션 대비 _msgSender 사용
        _setTokenURI(tokenId, tokenURI);
        _allTokenIds.push(tokenId);
        emit Minted(_msgSender(), tokenId, tokenURI);
        return tokenId;
    }

    // ✅ ⭐️ 모든 발행된 TokenId 배열 가져오기
    function getAllTokenIds() public view returns (uint256[] memory) {
        return _allTokenIds;
    }
}

import { useNFTList } from "../hooks/useNFTList";
import { usePagination } from "../hooks/usePagination";
import "../css/NFTListPage.css";  // ✅ 스타일 import

export default function NFTListPage() {
    const { nftList, loading } = useNFTList();
    const { currentPage, totalPages, currentData, goToPage } = usePagination(nftList, 9);

    if (loading) {
        return <p>Loading NFTs...</p>;
    }

    return (
        <div className="nft-page-container">
            <h1 className="nft-title">🎨 NFT 리스트</h1>
            <div className="nft-grid">
                {currentData.map((nft) => (
                    <div key={nft.tokenId} className="nft-card">
                        <div className="nft-image-container">
                            <img
                                src={nft.metadata.image}
                                alt={nft.metadata.name}
                                className="nft-image"
                            />
                        </div>
                        <div className="nft-content">
                            <h3 className="nft-name">{nft.metadata.name}</h3>
                            <p className="nft-description">{nft.metadata.description}</p>
                            <p className="nft-info"><small>발행자: {nft.minter}</small></p>
                            <p className="nft-info"><small>발행 날짜: {nft.mintedAt}</small></p>
                            <p className="nft-info"><small>소유자: {nft.owner}</small></p>
                            <p className="nft-info"><small>Token ID: {nft.tokenId}</small></p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                    Prev
                </button>
                <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                </span>
                <button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
}

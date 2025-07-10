import React, { useState } from "react";
import { useMyNFTList } from "../hooks/useMyNFTList";
import NFTCard from "../components/NFTCard";
import PaginationControls from "../components/PaginationControls";
import { usePagination } from "../hooks/usePagination";

export default function MyNFTListPage() {
    const { nftList, loading } = useMyNFTList();
    const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
    const { currentPage, totalPages, currentData, goToPage } = usePagination(nftList, 9);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <p className="text-gray-300 text-lg">Loading my NFTs...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-12">
            <h1 className="text-4xl font-bold text-center text-gray-100 mb-10">내 NFT 리스트</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {currentData.map((nft) => (
                    <NFTCard
                        key={nft.tokenId}
                        nft={nft}
                        detailLevel="simple"                // ⭐️ simple 모드!
                        isSelectable
                        isSelected={selectedTokenId === nft.tokenId}
                        onSelect={() => setSelectedTokenId(nft.tokenId)}
                        onCancel={() => setSelectedTokenId(null)}
                    />
                ))}
            </div>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                goToPage={goToPage}
            />
        </div>
    );
}

import React from "react";
import { usePagination } from "../hooks/usePagination";
import AuctionCard from "../components/AuctionCard";
import PaginationControls from "../components/PaginationControls";
import { useAuctionList } from "../hooks/useAuctionList";
import "../css/index.css";
import { useState } from "react";

export default function AuctionPage() {
    const { auctionList, loading } = useAuctionList();
    const { currentPage, totalPages, currentData, goToPage } = usePagination(auctionList, 9);

    const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <p className="text-gray-300 text-lg">Loading Auctions...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-12"
            onClick={() => setSelectedAuctionId(null)}>
            <h1 className="text-4xl font-bold text-center text-gray-100 mb-10">경매 목록</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {currentData.map((auction) => (
                    <AuctionCard
                        key={auction.id}
                        auction={auction}
                        detailLevel="auction-list"
                        isSelected={selectedAuctionId === auction.id}
                        onSelect={() => setSelectedAuctionId(auction.id)}
                        onCancel={() => setSelectedAuctionId(null)}
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

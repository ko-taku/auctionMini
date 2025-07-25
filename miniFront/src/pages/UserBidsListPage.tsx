import React, { useState } from "react";
import { useUserBidsList } from "../hooks/useUserBidList";
import { usePagination } from "../hooks/usePagination";
import MyBidAuctionCard from "../components/MyBidAuctionCard";
import AuctionBidForm from "../components/AuctionBidForm";
import PaginationControls from "../components/PaginationControls";

export default function UserBidsListPage() {
    const { bids, loading } = useUserBidsList();
    const { currentPage, totalPages, currentData, goToPage } = usePagination(bids, 9);
    const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <p className="text-gray-300 text-lg">Loading Bids...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-12">
            <h1 className="text-4xl font-bold text-center text-gray-100 mb-10">내 입찰 목록</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {currentData.map((auction) => (
                    selectedAuctionId === auction.id ? (
                        <AuctionBidForm
                            key={auction.id}
                            auction={auction}
                        />
                    ) : (
                        <MyBidAuctionCard
                            key={auction.id}
                            auction={auction}
                            isSelected={selectedAuctionId === auction.id}
                            onSelect={() => setSelectedAuctionId(auction.id)}
                        />
                    )
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
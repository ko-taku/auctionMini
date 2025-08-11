import React, { useState } from "react";
import { usePagination } from "../hooks/usePagination";
import BettingCard from "../components/BettingCard";
import PaginationControls from "../components/PaginationControls";
import { useBettingList } from "../hooks/useBettingList";
import "../css/index.css";
import { ChartCarousel } from "../components/chart/ChartCarousel";
import { SearchBox } from "../components/utils/SearchBox";
import RightSideCollections from "../components/RightSideCollections";
import { SortToolbar } from "../components/SortToolbar";
import { useAuctionSort } from "../hooks/useAuctionSort";

export default function BettingListPage() {
    const { bettingList, filteredList, searchQuery, setSearchQuery, loading } = useBettingList();

    const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);
    const { sort, setSort, sortedList } = useAuctionSort(filteredList);
    const { currentPage, totalPages, currentData, goToPage } = usePagination(sortedList, 9);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <p className="text-gray-300 text-lg">Loading Betting List...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-12" onClick={() => setSelectedAuctionId(null)}>
            <h1 className="text-4xl font-bold text-center text-gray-100 mb-10">Prediction Betting</h1>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-6 max-w-7xl mx-auto">

                {/* 왼쪽 배팅 목록 영역 */}
                <div className="bg-gray-800 p-4">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-white leading-none">
                            Predict the Winning Price!
                        </h2>

                        <div className="flex-1 translate-y-[15px] translate-x-[-15px]">
                            <SearchBox
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                            />
                        </div>
                    </div>

                    <div className="my-6 max-w-6xl mx-auto relative">
                        <ChartCarousel />
                    </div>

                    <h2 className="mt-8 ml-2 text-base uppercase text-gray-100 tracking-widest mb-2">
                        Prediction Market
                    </h2>
                    <p className="ml-2 mb-5 text-sm text-gray-400 tracking-widest mb-2">
                        참여 후 정확히 예측해보세요!
                    </p>

                    <div className="ml-2 mt-2 mb-5">
                        <SortToolbar selected={sort} onChange={setSort} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {currentData.map((auction) => (
                            <BettingCard
                                key={auction.id}
                                auction={auction}
                                isSelected={selectedAuctionId === auction.id}
                                onSelect={() => setSelectedAuctionId(auction.id)}
                                onCancel={() => setSelectedAuctionId(null)}
                            />
                        ))}
                    </div>
                </div>

                {/* 오른쪽 컬렉션 */}
                <aside className="bg-gray-800 rounded-xl h-fit">
                    <RightSideCollections />
                </aside>
            </div>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                goToPage={goToPage}
            />
        </div>
    );
}

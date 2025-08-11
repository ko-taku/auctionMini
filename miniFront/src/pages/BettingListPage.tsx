import React, { useState } from "react";
import { usePagination } from "../hooks/usePagination";
import BettingCard from "../components/BettingCard";
import BettingResultCard from "../components/BettingResultCard";
import PaginationControls from "../components/PaginationControls";
import { useBettingList } from "../hooks/useBettingList";
import "../css/index.css";
import { SearchBox } from "../components/utils/SearchBox";
import RightSideCollections from "../components/RightSideCollections";
import { SortToolbar } from "../components/SortToolbar";
import { useAuctionSort } from "../hooks/useAuctionSort";
import { useBettingSort } from "../hooks/useBettingSort";

export default function BettingListPage() {
    const {
        filteredOngoing,
        filteredResults,
        searchQuery,
        setSearchQuery,
        loading,
    } = useBettingList();

    const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);

    // 정렬 훅
    const { sort, setSort, sortedList: sortedOngoing } = useAuctionSort(filteredOngoing);
    const { sortedList: sortedResultList } = useBettingSort(filteredResults); // 종료된 배팅 정렬

    // pagination
    const {
        currentPage: ongoingPage,
        totalPages: ongoingTotalPages,
        currentData: ongoingCurrentData,
        goToPage: goToOngoingPage,
    } = usePagination(sortedOngoing, 6);

    const {
        currentPage: resultPage,
        totalPages: resultTotalPages,
        currentData: resultCurrentData,
        goToPage: goToResultPage,
    } = usePagination(sortedResultList, 6);

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
                {/* 왼쪽 배팅 콘텐츠 */}
                <div className="bg-gray-800 p-4 rounded-xl">
                    {/* 검색 */}
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

                    {/* 섹션: 진행 중 배팅 */}
                    <section className="mb-10">
                        <h2 className="ml-2 text-base uppercase text-gray-100 tracking-widest mb-2">
                            진행 중인 배팅
                        </h2>
                        <p className="ml-2 mb-5 text-sm text-gray-400 tracking-widest">
                            지금 참여할 수 있는 예측 배팅입니다!
                        </p>

                        <div className="ml-2 mb-5">
                            <SortToolbar selected={sort} onChange={setSort} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                            {ongoingCurrentData.map((auction) => (
                                <BettingCard
                                    key={auction.id}
                                    auction={auction}
                                    isSelected={selectedAuctionId === auction.id}
                                    onSelect={() => setSelectedAuctionId(auction.id)}
                                    onCancel={() => setSelectedAuctionId(null)}
                                />
                            ))}
                        </div>

                        <PaginationControls
                            currentPage={ongoingPage}
                            totalPages={ongoingTotalPages}
                            goToPage={goToOngoingPage}
                        />
                    </section>

                    {/* 섹션: 종료된 배팅 */}
                    <section>
                        <h2 className="ml-2 text-base uppercase text-gray-100 tracking-widest mb-2">
                            종료된 배팅 결과
                        </h2>
                        <p className="ml-2 mb-5 text-sm text-gray-400 tracking-widest">
                            결과가 확정된 배팅입니다. 당첨자와 낙찰 정보를 확인해보세요.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                            {resultCurrentData.map((result) => (
                                <BettingResultCard key={result.auctionId} result={result} />
                            ))}
                        </div>

                        <PaginationControls
                            currentPage={resultPage}
                            totalPages={resultTotalPages}
                            goToPage={goToResultPage}
                        />
                    </section>
                </div>

                {/* 오른쪽 영역 */}
                <aside className="bg-gray-800 rounded-xl h-fit">
                    <RightSideCollections />
                </aside>
            </div>
        </div>
    );
}

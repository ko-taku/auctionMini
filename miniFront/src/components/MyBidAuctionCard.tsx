import React from "react";
import dayjs from "dayjs"; // ⬅️ 설치 후 import
import type { UserBidAuctionItem } from "../types/UserBidAuctionItem";
import CountdownTimer from "./CountdownTimer";
import AuctionBidForm from "./AuctionBidForm";

export default function MyBidAuctionCard({
    auction,
    isSelected,
    onSelect,
}: {
    auction: UserBidAuctionItem;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const isHighestBidder = auction.isHighestBidder;
    const isEnded = dayjs().isAfter(dayjs(auction.endAt));

    // ✅ 선택된 상태 && 경매 종료 안 됐을 때만 입찰 폼 렌더
    if (isSelected && !isEnded) {
        return <AuctionBidForm auction={auction} />;
    }

    return (
        <div
            onClick={() => {
                if (!isEnded) onSelect(); // ✅ 종료된 경매 클릭 시 무시
            }}
            className={`bg-gray-800 border rounded-xl shadow-lg overflow-hidden flex flex-col transition hover:ring-2 hover:ring-blue-400 cursor-pointer ${isHighestBidder ? "border-yellow-500 ring-2 ring-yellow-500" : "border-gray-700"
                }`}
        >
            {/* 이미지 */}
            <div className="h-64 bg-gray-700 overflow-hidden">
                <img
                    src={auction.nftMetadata.image}
                    alt={auction.nftMetadata.name}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* 본문 */}
            <div className="flex flex-col p-4 flex-1">
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{auction.nftMetadata.description}</p>

                {/* 입찰 정보 */}
                <div className="mt-4 border-t border-gray-700 pt-4 text-sm text-gray-300">
                    <div className="grid gap-y-2" style={{ gridTemplateColumns: '30% 70%' }}>
                        <div className="text-left pr-2 text-gray-400">my 입찰 횟수</div>
                        <div className="text-center break-words">{auction.bidCount}</div>

                        <div className="text-left pr-2 text-gray-400">my 최고 입찰가</div>
                        <div className="text-center break-words">{auction.userMaxBid}</div>

                        <div className="text-left pr-2 text-gray-400">현재 최고가</div>
                        <div className="text-center break-words">{auction.highestBid}</div>

                        <div className="text-left pr-2 text-gray-400">남은 시간</div>
                        <div className="text-center break-words">
                            <CountdownTimer endTime={auction.endAt} />
                        </div>
                    </div>
                </div>

                {/* 시각적 바 (내 입찰가 vs 최고가) */}
                <div className="mt-4">
                    <div className="w-full bg-gray-600 h-2 rounded-full">
                        <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                                width: `${Math.min(
                                    (Number(auction.userMaxBid) / Number(auction.highestBid)) * 100,
                                    100
                                )
                                    }%`,
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

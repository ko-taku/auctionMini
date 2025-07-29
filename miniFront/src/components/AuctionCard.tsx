import React from "react";
import dayjs from "dayjs"; // 이미 프로젝트에 설치되어 있다면 사용
import type { AuctionItem } from "../types/AuctionItem";
import AuctionBidForm from "./AuctionBidForm";
import CountdownTimer from "./CountdownTimer";

type AuctionCardProps = {
    auction: AuctionItem;
    detailLevel?: "auction-list";
    isSelected?: boolean;
    onSelect?: () => void;
    onCancel?: () => void;
};

export default function AuctionCard({
    auction,
    detailLevel,
    isSelected,
    onSelect,

}: AuctionCardProps) {
    // ✅ 선택 상태이면 입찰 폼 렌더
    if (isSelected && detailLevel === "auction-list") {
        return (
            <AuctionBidForm
                auction={auction}
            />
        );
    }

    const isAuctionEnded = dayjs().isAfter(dayjs(auction.endAt));

    // ✅ 경매가 종료되지 않았고 선택된 경우에만 입찰폼 렌더
    if (!isAuctionEnded && isSelected && detailLevel === "auction-list") {
        return <AuctionBidForm auction={auction} />;
    }

    // ✅ 기본 카드 뷰
    return (
        <div
            className="
        bg-gray-800 border border-gray-700 rounded-xl shadow-lg
        overflow-hidden flex flex-col hover:ring-2 hover:ring-blue-400 transition cursor-pointer
      "
            onClick={(e) => {
                e.stopPropagation(); // ✅ 부모 클릭 이벤트 막기
                // ✅ 종료된 경매면 선택 막기
                if (isAuctionEnded) return;
                onSelect?.();
            }}
        >
            {/* 이미지 */}
            <div
                className="h-64 bg-gray-700 overflow-hidden"
            >
                <img
                    src={auction.nftMetadata.image}
                    alt={auction.nftMetadata.name}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* 본문 */}
            <div className="flex flex-col p-4 flex-1">
                {/* 제목 */}
                <h3 className="text-lg font-bold text-gray-100 mb-2">
                    {auction.nftMetadata.name}
                </h3>

                {/* 설명 */}
                <p className="text-gray-400 mb-4 text-sm line-clamp-3">
                    {auction.nftMetadata.description}
                </p>

                {/* 경매 정보 */}
                <div className="mt-4 border-t border-gray-700 pt-4 text-sm text-gray-300">
                    <div className="grid gap-y-2" style={{ gridTemplateColumns: '30% 70%' }}>
                        <div className="text-left pr-2 text-gray-400">시작가</div>
                        <div className="text-center break-words">{auction.startPrice} ATK</div>

                        <div className="text-left pr-2 text-gray-400">현재가</div>
                        <div className="text-center break-words">{auction.highestBid !== null ? auction.highestBid : auction.startPrice} ATK</div>

                        <div className="text-left pr-2 text-gray-400">최소 상승가</div>
                        <div className="text-center break-words">{auction.minIncrement} ATK</div>

                        <div className="text-left pr-2 text-gray-400">총 입찰 수</div>
                        <div className="text-center break-words">{auction.totalBids} 건</div>

                        <div className="text-left pr-2 text-gray-400">남은 시간</div>
                        <div className="text-center break-words">
                            <CountdownTimer endTime={auction.endAt} />
                        </div>

                        <div className="text-left pr-2 text-gray-400">등록자</div>
                        <div className="text-center break-words">
                            {auction.creator?.slice(0, 10)}...{auction.creator?.slice(-6)}
                        </div>

                        <div className="text-left pr-2 text-gray-400">경매번호</div>
                        <div className="text-center break-words">{auction.id}</div>

                        <div className="text-left pr-2 text-gray-400">Token ID</div>
                        <div className="text-center break-words">{auction.tokenId}</div>
                    </div>
                </div>

            </div>
        </div>
    );
}
import React from "react";
import type { AuctionItem } from "../types/AuctionItem";

type AuctionCardProps = {
    auction: AuctionItem;
    onBidClick?: (auction: AuctionItem) => void;
};

export default function AuctionCard({ auction, onBidClick }: AuctionCardProps) {
    const handleBid = () => {
        if (onBidClick) onBidClick(auction);
    };

    return (
        <div
            className="
        bg-gray-800 border border-gray-700 rounded-xl shadow-lg
        overflow-hidden flex flex-col hover:ring-2 hover:ring-blue-400 transition
      "
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
                {/* 제목 */}
                <h3 className="text-lg font-bold text-gray-100 mb-2">
                    {auction.nftMetadata.name}
                </h3>

                {/* 설명 */}
                <p className="text-gray-400 mb-4 text-sm line-clamp-3">
                    {auction.nftMetadata.description}
                </p>

                {/* 경매 정보 */}
                <div className="mt-4 border-t border-gray-700 pt-4 text-sm text-gray-400 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-300">시작가</span>
                        <span>{auction.startPrice}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-300">현재가</span>
                        <span>{auction.highestBid ?? "-"}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-300">종료일</span>
                        <span>{auction.endAt}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-300">등록자</span>
                        <span className="break-all">{auction.creator}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-300">Token ID</span>
                        <span>{auction.tokenId}</span>
                    </div>
                </div>

                {/* 입찰 버튼 */}
                <button
                    onClick={handleBid}
                    className="
            mt-4 py-2 rounded bg-blue-600 text-white
            hover:bg-blue-500 transition
          "
                >
                    입찰하기
                </button>
            </div>
        </div>
    );
}

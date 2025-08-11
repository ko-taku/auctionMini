import React, { useState } from "react";
import dayjs from "dayjs";
import type { AuctionItem } from "../types/AuctionItem";
import CountdownTimer from "./CountdownTimer";
import BettingForm from "./BettingForm";

type BettingCardProps = {
    auction: AuctionItem;
    isSelected?: boolean; // ✅ 추가
    onSelect?: () => void; // ✅ 추가
    onCancel?: () => void; // ✅ 추가
};

export default function BettingCard({ auction }: BettingCardProps) {
    const [hasBet, setHasBet] = useState(false);
    const [isSelected, setIsSelected] = useState(false);

    const now = dayjs();
    const auctionEnd = dayjs(auction.endAt);
    const bettingDeadline = auctionEnd.subtract(3, "hour");

    const isAuctionEnded = now.isAfter(auctionEnd);
    const isBettingClosed = now.isAfter(bettingDeadline);

    const handleSuccess = () => {
        setHasBet(true);
        setIsSelected(false); // 폼 닫고 다시 카드 뷰로 전환
    };

    // ✅ 배팅 폼 조건
    if (!isAuctionEnded && !hasBet && isSelected && !isBettingClosed) {
        return (
            <BettingForm
                auction={auction}
                onSuccess={handleSuccess}
                isBettingClosed={isBettingClosed}
                bettingDeadline={bettingDeadline.toISOString()}
            />
        );
    }

    return (
        <div
            className="relative flex w-full h-72 rounded-xl overflow-hidden text-white shadow-lg cursor-pointer"
            onClick={() => {
                if (isAuctionEnded || isBettingClosed || hasBet) return;
                setIsSelected(true);
            }}
            style={{
                backgroundImage: `url(${auction.nftMetadata.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* 어두운 오버레이 */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* 왼쪽 정보 */}
            <div className="relative z-10 w-2/3 p-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{auction.nftMetadata.name}</h2>
                    <p className="text-sm text-gray-300 mt-1 line-clamp-2">{auction.nftMetadata.description}</p>
                </div>

                <div className="text-sm text-gray-300 grid grid-cols-2 gap-2 mt-4">
                    <span>경매 ID:</span>
                    <span>{auction.id}</span>
                    <span>현재가:</span>
                    <span>{auction.highestBid} ATK</span>
                    <span>남은 시간:</span>
                    <span><CountdownTimer endTime={auction.endAt} /></span>
                    <span>배팅 상태:</span>
                    <span>
                        {isBettingClosed
                            ? "⛔ 마감됨"
                            : hasBet
                                ? "✅ 참여 완료"
                                : "🟢 참여 가능"}
                    </span>
                </div>
            </div>

            {/* 오른쪽 이미지 썸네일 */}
            <div className="relative z-10 w-1/3 p-4 flex justify-end items-end">
                <img
                    src={auction.nftMetadata.image}
                    alt={auction.nftMetadata.name}
                    className="w-28 h-28 rounded-lg object-cover border border-white"
                />
            </div>
        </div>
    );
}

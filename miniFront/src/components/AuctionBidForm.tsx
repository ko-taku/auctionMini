import React, { useState } from "react";
import type { AuctionItem } from "../types/AuctionItem";
import { useBidRegister } from "../hooks/useBidRegister";
import CountdownTimer from "./CountdownTimer";

type AuctionBidFormProps = {
    auction: AuctionItem;
};

export default function AuctionBidForm({ auction }: AuctionBidFormProps) {
    const [bidAmount, setBidAmount] = useState<string>("");
    const { registerBid, loading, error } = useBidRegister();

    const handleBidClick = async () => {
        if (!bidAmount || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) {
            alert("유효한 입찰 금액을 입력해주세요.");
            return;
        }
        console.log("✅ 입찰 실행!", {
            auctionId: auction.id,
            bidAmount
        });
        try {
            await registerBid({
                auctionId: auction.id,
                amount: bidAmount,
            });
            alert("✅ 입찰이 완료되었습니다!");
            // 상위 컴포넌트가 선택 해제하게 해주는 onSuccess 콜백 등을 여기에 추가할 수도 있어
        } catch (e) {
            console.error("❌ 입찰 실패", e);
            alert("❌ 입찰 중 오류가 발생했습니다.");
        }
    };
    return (
        <div
            className="
    w-full h-full
    bg-gray-800 border border-gray-700 rounded-xl shadow-lg
    flex flex-col p-4
  "
            onClick={(e) => e.stopPropagation()}
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

            {/* 제목 */}
            <h2 className="text-lg font-bold text-white mb-2">
                {auction.nftMetadata.name}
            </h2>

            {/* 설명 */}
            <p className="text-gray-400 text-sm mb-4">
                {auction.nftMetadata.description}
            </p>

            {/* 입찰 정보 */}
            <div className="mt-4 border-t border-gray-700 pt-4 text-sm text-gray-300">
                <div className="grid gap-y-2" style={{ gridTemplateColumns: '30% 70%' }}>
                    <div className="text-left pr-2 text-gray-400">시작가</div>
                    <div className="text-center break-words">{auction.startPrice}</div>

                    <div className="text-left pr-2 text-gray-400">현재 입찰가</div>
                    <div className="text-center break-words">{auction.highestBid ?? "-"}</div>

                    <div className="text-left pr-2 text-gray-400">최소 상승가</div>
                    <div className="text-center break-words">{auction.minIncrement ?? "-"}</div>

                    <div className="text-left pr-2 text-gray-400">남은 시간</div>
                    <div className="text-center break-words">
                        <CountdownTimer endTime={auction.endAt} />
                    </div>
                </div>
            </div>

            {/* 입찰 입력 */}
            <input
                type="number"
                min={0}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="입찰 금액 입력"
                className="bg-gray-700 text-white rounded px-4 py-2 mb-4 w-full"
            />

            {/* 입찰 버튼 */}
            <div className="mt-auto">
                <button
                    onClick={handleBidClick}
                    disabled={loading}
                    className={`
            w-full px-4 py-2 rounded
            ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"}
            text-white transition
          `}
                >
                    {loading ? "입찰 중..." : "입찰하기"}
                </button>
            </div>
            {/* 에러 메시지 */}
            {error && (
                <p className="text-red-400 text-sm mt-2">
                    {error}
                </p>
            )}

        </div>

    );
}
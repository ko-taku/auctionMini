// components/BettingResultCard.tsx
import React, { useState } from "react";
import type { BettingResultItem } from "../types/BettingResultItem";
import { Badge } from "./ui/Badge";
import { calculateAccuracy } from "./utils/calculateAccuracy";

type Props = {
    result: BettingResultItem;
};

export default function BettingResultCard({ result }: Props) {
    const {
        image,
        name,
        auctionId,
        finalPrice,
        winnerAddresses,
    } = result;

    const [expanded, setExpanded] = useState(false);
    const visibleWinners = expanded ? winnerAddresses : winnerAddresses.slice(0, 1);

    return (
        <div
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg
                overflow-hidden flex flex-col transition cursor-default relative"
        >
            {/* 배팅 종료됨 배지 */}
            <div className="absolute top-2 left-2">
                <Badge variant="destructive">배팅 종료됨</Badge>
            </div>

            {/* 이미지 */}
            <div className="h-64 bg-gray-700 overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* 본문 */}
            <div className="flex flex-col p-4 flex-1">
                {/* 제목 */}
                <h3 className="text-lg font-bold text-gray-100 mb-2">{name}</h3>

                {/* 경매 정보 */}
                <div className="mt-2 border-t border-gray-700 pt-4 text-sm text-gray-300">
                    <div className="grid gap-y-2" style={{ gridTemplateColumns: "35% 65%" }}>
                        <div className="text-left pr-2 text-gray-400">경매 번호</div>
                        <div className="text-left break-words">{auctionId}</div>

                        <div className="text-left pr-2 text-gray-400">낙찰가</div>
                        <div className="text-left break-words">{finalPrice} ATK</div>

                        <div className="text-left pr-2 text-gray-400">예측 금액</div>
                        <div className="text-left break-words">{result.bettingWinnerAmount} ATK</div>

                        <p className="text-sm text-gray-400">
                            예측 정확도: {calculateAccuracy(result.bettingWinnerAmount, Number(finalPrice))}
                        </p>

                        <div className="text-left pr-2 text-gray-400">당첨자 수</div>
                        <div className="text-left break-words">{winnerAddresses.length}명</div>


                        <div className="text-left pr-2 text-gray-400">당첨자 주소</div>
                        <div className="text-left break-words">
                            {visibleWinners.map((addr, i) => (
                                <div key={i}>
                                    {addr.slice(0, 8)}...{addr.slice(-6)}
                                </div>
                            ))}
                            {winnerAddresses.length > 1 && !expanded && (
                                <button
                                    className="mt-1 text-blue-400 hover:underline text-xs"
                                    onClick={() => setExpanded(true)}
                                >
                                    더보기
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

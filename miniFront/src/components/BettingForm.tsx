import React, { useState } from "react";
import type { AuctionItem } from "../types/AuctionItem";
import dayjs from "dayjs";

type Props = {
    auction: AuctionItem;
    onSuccess: () => void;
    isBettingClosed: boolean;
    bettingDeadline: string;
};

export default function BettingForm({ auction, onSuccess, isBettingClosed, bettingDeadline }: Props) {
    const [betAmount, setBetAmount] = useState<number>(10);
    const [prediction, setPrediction] = useState<string>("");

    const currentPrice = Number(auction.highestBid ?? auction.startPrice);

    const handlePredictionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const parsed = parseFloat(value);
        if (!isNaN(parsed) && parsed >= currentPrice) {
            setPrediction(value);
        }
    };

    const handleBetSubmit = () => {
        console.log("배팅 금액:", betAmount);
        console.log("예측 금액:", prediction);
        // TODO: 서버 요청 성공 시
        onSuccess();
    };

    if (isBettingClosed) {
        return (
            <div className="bg-gray-800 border border-red-500 rounded-xl p-6 text-white max-w-xl mx-auto">
                <h2 className="text-xl font-bold mb-4">🎯 경매 #{auction.id} 배팅</h2>
                <p className="text-red-400 font-semibold">배팅 마감 시간이 지났습니다.</p>
                <p className="text-sm text-gray-400 mt-2">
                    배팅 마감: {dayjs(bettingDeadline).format("YYYY-MM-DD HH:mm")}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 border border-green-500 rounded-xl p-6 text-white max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-4">🎯 경매 #{auction.id} 예측 배팅</h2>

            <div className="mb-4">
                <p className="text-sm text-gray-300 mb-1">배팅 금액</p>
                <div className="flex gap-3">
                    {[10, 50, 100].map((amt) => (
                        <button
                            key={amt}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${betAmount === amt ? "bg-green-500 text-white" : "bg-gray-700 hover:bg-gray-600"
                                }`}
                            onClick={() => setBetAmount(amt)}
                        >
                            {amt} ENG
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <p className="text-sm text-gray-300 mb-1">예측 낙찰가 (현재가: {currentPrice} ATK)</p>
                <input
                    type="number"
                    min={currentPrice}
                    step="1"
                    placeholder={`예: ${currentPrice + 10}`}
                    value={prediction}
                    onChange={handlePredictionChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
                {prediction !== "" && parseFloat(prediction) < currentPrice && (
                    <p className="text-red-500 text-sm mt-1">현재가보다 높은 금액을 입력해주세요.</p>
                )}
            </div>

            <button
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition"
                onClick={handleBetSubmit}
                disabled={prediction === "" || parseFloat(prediction) < currentPrice}
            >
                배팅 제출
            </button>

            <p className="text-xs text-gray-500 mt-4">
                ⏱ 배팅 마감: {dayjs(bettingDeadline).format("YYYY-MM-DD HH:mm")}
            </p>
        </div>
    );
}

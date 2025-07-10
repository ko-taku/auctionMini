import React, { useState } from "react";
import type { NFTItem } from "../types/NFTItem";
import { useAuctionRegister } from "../hooks/useAuctionRegister";

type AuctionRegisterFormProps = {
    nft: NFTItem;
    onCancel: () => void;
};

export default function AuctionRegisterForm({
    nft,
    onCancel,
}: AuctionRegisterFormProps) {
    const [startPrice, setStartPrice] = useState("");
    const [minIncrement, setMinIncrement] = useState("");
    const [days, setDays] = useState("0");
    const [hours, setHours] = useState("0");
    const [minutes, setMinutes] = useState("0");

    const { escrowAndRegister, loading, error } = useAuctionRegister();

    const onClickRegister = async () => {
        console.log('✅ AuctionRegisterForm values:', {
            contractAddress: nft.contractAddress,
            tokenId: nft.tokenId,
            startPrice,
            minIncrement,
            days,
            hours,
            minutes
        });

        try {
            await escrowAndRegister({
                contractAddress: nft.contractAddress ?? "",
                tokenId: nft.tokenId,
                startPrice,
                minIncrement,
                days,
                hours,
                minutes
            });
            onCancel();
        } catch {
            // 이미 훅에서 error 상태 관리하니까 여기서는 아무것도 안 해도 OK
        }
    };

    return (
        <div className="p-4 flex flex-col space-y-3 bg-gray-800 h-full">
            <h3 className="text-lg font-bold text-gray-100">
                경매 등록 - NFT #{nft.tokenId}
            </h3>

            <img
                src={nft.metadata.image}
                alt={nft.metadata.name}
                className="h-48 object-cover rounded"
            />

            <input
                className="px-3 py-2 rounded bg-gray-700 text-gray-200"
                placeholder="시작가 (ERC20)"
                value={startPrice}
                onChange={(e) => setStartPrice(e.target.value)}
            />

            <input
                className="px-3 py-2 rounded bg-gray-700 text-gray-200"
                placeholder="최소 인상 단위"
                value={minIncrement}
                onChange={(e) => setMinIncrement(e.target.value)}
            />

            <div className="flex space-x-2 items-center">
                <input
                    type="number"
                    min="0"
                    max="7"
                    className="w-16 px-2 py-1 rounded bg-gray-700 text-gray-200 text-center"
                    placeholder="일"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                />
                <span className="text-gray-300">일</span>

                <input
                    type="number"
                    min="0"
                    max="23"
                    className="w-16 px-2 py-1 rounded bg-gray-700 text-gray-200 text-center"
                    placeholder="시간"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                />
                <span className="text-gray-300">시간</span>

                <input
                    type="number"
                    min="0"
                    max="59"
                    className="w-16 px-2 py-1 rounded bg-gray-700 text-gray-200 text-center"
                    placeholder="분"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                />
                <span className="text-gray-300">분</span>
            </div>

            {error && (
                <div className="text-red-400 text-sm pt-1">
                    {error}
                </div>
            )}

            <div className="pt-2">
                <button
                    onClick={onClickRegister}
                    disabled={loading}
                    className={`w-full py-2 rounded ${loading
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-500"
                        }`}
                >
                    {loading ? "등록 중..." : "등록"}
                </button>
            </div>
        </div>
    );
}

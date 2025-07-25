import React from "react";
import type { NFTItem } from "../types/NFTItem";
import AuctionRegisterForm from "./AuctionRegisterForm";

type NFTCardProps = {
    nft: NFTItem;
    detailLevel?: "simple" | "full";
    isSelectable?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
    onCancel?: () => void;
};

export default function NFTCard({
    nft,
    detailLevel = "full",
    isSelectable = false,
    isSelected = false,
    onSelect,
    onCancel,
}: NFTCardProps) {
    // 클릭 핸들러 → simple 모드에서만
    const handleClick = () => {
        if (detailLevel === "simple" && isSelectable && !isSelected && onSelect) {
            onSelect();
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
        bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden flex flex-col relative
        ${detailLevel === "simple" && isSelectable ? "cursor-pointer" : ""}
        ${isSelected ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-blue-400 transition"}
      `}
        >
            {isSelected && detailLevel === "simple" ? (
                <AuctionRegisterForm nft={nft} onCancel={onCancel!} />
            ) : (
                <>
                    <div className="h-64 bg-gray-700 overflow-hidden">
                        <img
                            src={nft.metadata.image}
                            alt={nft.metadata.name}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="flex flex-col p-4 flex-1">
                        <h3 className="text-lg font-bold text-gray-100 mb-2">
                            {nft.metadata.name}
                        </h3>
                        <p className="text-gray-400 mb-4 text-sm line-clamp-3">
                            {nft.metadata.description}
                        </p>

                        <div className="mt-4 border-t border-gray-700 pt-4 text-sm text-gray-300">
                            <div className="grid gap-y-2" style={{ gridTemplateColumns: '30% 70%' }}>
                                {detailLevel === "full" && nft.minter && (
                                    <>
                                        <div className="text-left pr-2 text-gray-400">발행자</div>
                                        <div className="text-center break-words">{nft.minter}</div>
                                    </>
                                )}

                                {detailLevel === "full" && nft.mintedAt && (
                                    <>
                                        <div className="text-left pr-2 text-gray-400">발행 날짜</div>
                                        <div className="text-center break-words">{nft.mintedAt}</div>
                                    </>
                                )}

                                <div className="text-left pr-2 text-gray-400">소유자</div>
                                <div className="text-center break-words">{nft.owner}</div>

                                <div className="text-left pr-2 text-gray-400">Token ID</div>
                                <div className="text-center break-words">{nft.tokenId}</div>
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}

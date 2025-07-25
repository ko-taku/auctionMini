export type AuctionItem = {
    id: number;
    nftMetadata: {
        name: string;
        image: string;
        description: string;
    };
    creator: string;
    startPrice: string;
    highestBid?: string;
    minIncrement: string;         // ✅ 최소 상승가
    totalBids?: number;           // ✅ 총 입찰 수
    endAt: string;
    contractAddress: string;
    tokenId: string;
    active: boolean;
};
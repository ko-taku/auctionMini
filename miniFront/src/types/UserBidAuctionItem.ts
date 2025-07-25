export type UserBidAuctionItem = {
    id: number;
    tokenId: string;
    contractAddress: string;

    // 메타데이터
    nftMetadata: {
        name: string;
        image: string;
        description: string;
    };

    // 경매 정보
    startPrice: string;
    highestBid: string;
    minIncrement: string; // ✅ 추가
    endAt: string;
    active: boolean;
    creator: string; // ✅ 추가된 부분

    // 사용자 입찰 정보
    userMaxBid: string;
    bidCount: number;

    // 최고 입찰자인지 여부
    isHighestBidder: boolean;
};

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
    endAt: string;
    contractAddress: string;
    tokenId: string;
};

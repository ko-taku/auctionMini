export type NFTItem = {
    tokenId: string;
    owner: string;
    contractAddress?: string;
    mintAtRaw?: number;
    metadata: {
        name: string;
        description: string;
        image: string;
        [key: string]: any;
    };
    minter?: string;      // ✅ optional
    mintedAt?: string;    // ✅ optional
};

// src/types/BettingResultItem.ts
export type BettingResultItem = {
    auctionId: number;
    name: string;
    image: string;
    finalPrice: string;       // 예: "250"
    rewardAmount: string;     // 예: "50"
    winnerAddresses: string[]; // 당첨자 주소들
    bettingWinnerAmount: number;     // 당첨된 베팅 예상가
};

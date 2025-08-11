// hooks/useBettingSort.ts
import { useMemo, useState } from "react";
import type { AuctionItem } from "../types/AuctionItem";
import type { BettingResultItem } from "../types/BettingResultItem";

// 새로운 정렬 타입 정의
export type BettingSortType = "price-desc" | "price-asc" | "accuracy";

export function useBettingSort(resultList: BettingResultItem[]) {
    const [sort, setSort] = useState<BettingSortType>("price-desc");

    const sortedList = useMemo(() => {
        let list = [...resultList];

        switch (sort) {
            case "price-desc":
                return list.sort((a, b) => Number(b.finalPrice) - Number(a.finalPrice));
            case "price-asc":
                return list.sort((a, b) => Number(a.finalPrice) - Number(b.finalPrice));
            case "accuracy":
                return list.sort((a, b) => {
                    const aDiff = Math.abs(Number(a.bettingWinnerAmount) - Number(a.finalPrice));
                    const bDiff = Math.abs(Number(b.bettingWinnerAmount) - Number(b.finalPrice));
                    return aDiff - bDiff;
                });
            default:
                return list;
        }
    }, [resultList, sort]);

    return {
        sort,
        setSort,
        sortedList,
    };
}

// hooks/useAuctionSort.ts
import { useMemo, useState } from "react";
import type { AuctionItem } from "../types/AuctionItem";

export type SortType = "time" | "latest" | "price" | "active" | "ended";

export function useAuctionSort(auctionList: AuctionItem[]) {
    const [sort, setSort] = useState<SortType>("time");

    const sortedList = useMemo(() => {
        let list = [...auctionList];

        switch (sort) {
            case "price":
                return list.sort(
                    (a, b) =>
                        Number(b.highestBid ?? b.startPrice) -
                        Number(a.highestBid ?? a.startPrice)
                );
            case "active":
                return list.filter((item) => item.active);
            case "ended":
                return list.filter((item) => !item.active);
            case "latest":
                return list.sort((a, b) => b.id - a.id); // or b.createdAt.getTime() - a.createdAt.getTime()
            case "time":
            default:
                return list.sort((a, b) => {
                    const now = Date.now();
                    const aDiff = new Date(a.endAt).getTime() - now;
                    const bDiff = new Date(b.endAt).getTime() - now;

                    // 종료된 경매는 뒤로
                    if (aDiff < 0 && bDiff >= 0) return 1;
                    if (aDiff >= 0 && bDiff < 0) return -1;

                    // 둘 다 진행 중이거나 둘 다 종료됨
                    return aDiff - bDiff;
                });
        }
    }, [auctionList, sort]);

    return {
        sort,
        setSort,
        sortedList,
    };
}

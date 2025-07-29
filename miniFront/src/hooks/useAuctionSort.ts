// hooks/useAuctionSort.ts
import { useMemo, useState } from "react";
import type { AuctionItem } from "../types/AuctionItem";

export type SortType = "latest" | "price" | "active" | "ended";

export function useAuctionSort(auctionList: AuctionItem[]) {
    const [sort, setSort] = useState<SortType>("latest");

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
            default:
                return list.sort((a, b) => b.id - a.id); // or b.createdAt.getTime() - a.createdAt.getTime()
        }
    }, [auctionList, sort]);

    return {
        sort,
        setSort,
        sortedList,
    };
}

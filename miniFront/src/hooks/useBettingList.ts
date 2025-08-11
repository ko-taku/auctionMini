import { useEffect, useState } from "react";
import type { AuctionItem } from "../types/AuctionItem";
import type { BettingResultItem } from "../types/BettingResultItem";
import { useAuthContext } from "../contexts/AuthContext";


type UseBettingListResult = {
    ongoingList: AuctionItem[];
    resultList: BettingResultItem[];
    filteredOngoing: AuctionItem[];
    filteredResults: BettingResultItem[];
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    loading: boolean;
};

export function useBettingList(): UseBettingListResult {
    const { token } = useAuthContext();

    const [loading, setLoading] = useState(true);
    const [ongoingList, setOngoingList] = useState<AuctionItem[]>([]);
    const [resultList, setResultList] = useState<BettingResultItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [ongoingRes, resultRes] = await Promise.all([
                    fetch(`http://localhost:3000/betting/available`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`http://localhost:3000/betting/results`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (!ongoingRes.ok) throw new Error(await ongoingRes.text());
                if (!resultRes.ok) throw new Error(await resultRes.text());

                const ongoing = await ongoingRes.json();
                const results = await resultRes.json();

                console.log("🎯 배팅 진행중 목록:", ongoing);
                console.log("🎯 배팅 종료 목록:", results);

                setOngoingList(ongoing);
                setResultList(results);
            } catch (err) {
                console.error("❌ 배팅 리스트 불러오기 실패:", err);
                setOngoingList([]);
                setResultList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // ✅ 검색어 기준 필터링
    const filteredOngoing = ongoingList.filter(item =>
        item.nftMetadata.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredResults = resultList.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return {
        ongoingList,
        resultList,
        filteredOngoing,
        filteredResults,
        searchQuery,
        setSearchQuery,
        loading,
    };
}

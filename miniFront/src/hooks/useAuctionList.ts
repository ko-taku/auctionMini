import { useEffect, useState } from "react";
import type { AuctionItem } from "../types/AuctionItem";
import { useAuthContext } from "../contexts/AuthContext";

export function useAuctionList() {
    const { token } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [auctionList, setAuctionList] = useState<AuctionItem[]>([]);
    const [searchQuery, setSearchQuery] = useState(""); // ✅ 검색어 상태 추가

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                setLoading(true);

                // ✅ 서버에서 경매 리스트 GET
                const res = await fetch(`http://localhost:3000/auction/list`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!res.ok) throw new Error(await res.text());

                const data = await res.json();
                console.log("✅ 서버에서 가져온 경매 리스트:", data);

                // ✅ AuctionItem[] 형식 가정
                setAuctionList(data);
            } catch (err) {
                console.error("❌ 경매 리스트 불러오기 실패:", err);
                setAuctionList([]);  // 실패 시 비워주기
            } finally {
                setLoading(false);
            }
        };

        fetchAuctions();
    }, []);

    // ✅ 검색어 기준으로 필터링된 리스트 반환
    const filteredList = auctionList.filter(item =>
        item.nftMetadata.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
        auctionList,       // 전체 목록 (필터링 안된 원본)
        filteredList,      // 검색어로 필터링된 목록
        loading,
        searchQuery,
        setSearchQuery,
    };
}

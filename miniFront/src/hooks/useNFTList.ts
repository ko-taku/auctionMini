import { useEffect, useState } from "react";
import type { NFTItem } from "../types/NFTItem";
import { useAuthContext } from "../contexts/AuthContext";

export function useNFTList() {
    const { token } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [nftList, setNftList] = useState<NFTItem[]>([]);

    useEffect(() => {
        const fetchNFTs = async () => {
            try {
                setLoading(true);

                // ✅ 서버에서 NFT 리스트 GET
                const res = await fetch(`http://localhost:3000/nft/list`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!res.ok) throw new Error(await res.text());

                const data = await res.json();
                console.log("✅ 서버에서 가져온 NFT 리스트:", data);

                // ✅ NFTItem[] 형식 가정
                setNftList(data);
            } catch (err) {
                console.error("❌ NFT 리스트 불러오기 실패:", err);
                setNftList([]);  // 실패 시 비워주기
            } finally {
                setLoading(false);
            }
        };

        fetchNFTs();
    }, []);

    return { nftList, loading };
}

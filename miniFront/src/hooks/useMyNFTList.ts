import { useEffect, useState } from "react";
import { ethers } from "ethers";
import type { NFTItem } from "../types/NFTItem";
import NFTABI from "../abi/NFTContract.json";
import { useWallet } from "../contexts/WalletContext";

const NFT_CONTRACT_ADDRESS = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
const RPC_URL = import.meta.env.VITE_RPC_URL;

export function useMyNFTList() {
    const { address } = useWallet();
    const [loading, setLoading] = useState(true);
    const [nftList, setNftList] = useState<NFTItem[]>([]);

    useEffect(() => {
        if (!address) return;

        const fetchMyNFTs = async () => {
            try {
                setLoading(true);

                const provider = new ethers.JsonRpcProvider(RPC_URL);
                const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFTABI, provider);

                // ✅ 1️⃣ 내 지갑의 NFT 토큰ID 리스트 가져오기
                const ownedTokenIds = await contract.getTokensOfOwner(address);
                console.log("Owned token IDs:", ownedTokenIds);

                const results: NFTItem[] = [];

                // ✅ 2️⃣ 각 tokenId 별로 메타데이터 읽기
                for (const id of ownedTokenIds) {
                    const tokenIdStr = id.toString();

                    // tokenURI 가져오기
                    const tokenURI = await contract.tokenURI(id);

                    // 메타데이터 fetch
                    const res = await fetch(tokenURI);
                    const metadata = await res.json();

                    results.push({
                        tokenId: tokenIdStr,
                        owner: address,  // 내 address가 소유자
                        contractAddress: NFT_CONTRACT_ADDRESS,
                        metadata
                    });
                }
                results.sort((a, b) => Number(b.tokenId) - Number(a.tokenId));
                setNftList(results);
            } catch (err) {
                console.error("Error fetching my NFTs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyNFTs();
    }, [address]);

    return { nftList, loading };
}

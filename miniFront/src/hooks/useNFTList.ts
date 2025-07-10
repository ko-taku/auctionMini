import { useEffect, useState } from "react";
import { ethers } from "ethers";
import type { NFTItem } from "../types/NFTItem";
import NFTABI from "../abi/NFTContract.json";

const NFT_CONTRACT_ADDRESS = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
const RPC_URL = import.meta.env.VITE_RPC_URL;

function formatKoreanTime(unixTime: number): string {
    return new Date(unixTime * 1000).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Seoul'
    });
}

export function useNFTList() {
    const [loading, setLoading] = useState(true);
    const [nftList, setNftList] = useState<NFTItem[]>([]);

    useEffect(() => {
        const fetchNFTs = async () => {
            try {
                setLoading(true);
                const provider = new ethers.JsonRpcProvider(RPC_URL);
                const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFTABI, provider);

                // ✅ ① 모든 Minted 이벤트 로그
                //Minted 이벤트를 필터 객체로 만든다, 내 스마트 컨트랙트 이벤트 로그 중 Minted 이벤트만 찾을 필터
                const filter = contract.filters.Minted();
                //블록체인 로그에서 filter에 해당하는 이벤트 기록을 모두 가져온다
                const events = await contract.queryFilter(filter);

                // ✅ ② 블록 정보 캐시
                //키가 numberrh value가 number인 객체, 블록넘버 -> 블록.timestamp 매핑 저장해서 중복 호출 방지 캐시
                const blockCache: Record<number, number> = {};

                //타입스크립트에서는 :는 타입을 지정
                const results: NFTItem[] = [];

                //ethers v6의 queryFilter는 Log|EventLog 배열을 리턴하는데 EventLog만 args가 있다
                for (const event of events) {
                    if (!("args" in event) || !event.args) {
                        console.warn("skipped non-parsed log", event);
                        continue;
                    }
                    const tokenId = event.args.tokenId;
                    const minter = event.args.minter;
                    const tokenURI = event.args.uri;
                    const blockNumber = event.blockNumber;

                    // ✅ 블록 timestamp 가져오기
                    let mintedAt: number;
                    if (blockCache[blockNumber]) {
                        //캐시에서 꺼내서 사용, 네트워크 호출 안하므로 RPC비용 줄어들고 속도도 빠르다
                        mintedAt = blockCache[blockNumber];
                    } else {
                        const block = await provider.getBlock(blockNumber);

                        if (!block) {
                            console.warn(`Block ${blockNumber} not found`);
                            continue;
                        }

                        mintedAt = block.timestamp;
                        blockCache[blockNumber] = mintedAt;
                    }

                    // ✅ 현재 소유자
                    const owner = await contract.ownerOf(tokenId);

                    // ✅ 메타데이터
                    const res = await fetch(tokenURI);
                    const metadata = await res.json();

                    results.push({
                        tokenId: tokenId.toString(),
                        minter,
                        mintAtRaw: mintedAt,
                        mintedAt: formatKoreanTime(mintedAt),
                        owner,
                        metadata
                    });
                }

                results.sort((a, b) => (b.mintAtRaw ?? 0) - (a.mintAtRaw ?? 0));

                setNftList(results);
            } catch (err) {
                console.error("Error fetching NFT list:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNFTs();
    }, []);

    return { nftList, loading };
}

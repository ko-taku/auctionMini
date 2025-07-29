import { useAuctionList } from "../hooks/useAuctionList";
import { SortToolbar } from "../components/SortToolbar";
import { useAuctionSort } from "../hooks/useAuctionSort";
import CountdownTimerSmallImage from "./CountTimerSmallImage";

export default function RightSideCollections() {
    const { auctionList } = useAuctionList();
    const { sort, setSort, sortedList } = useAuctionSort(auctionList);

    return (
        <aside className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="translate-y-[12px] ml-2 text-xs uppercase text-gray-400 tracking-widest mb-2">
                    COLLECTION
                </h2>
                <div className="mt-3">
                    <SortToolbar selected={sort} onChange={setSort} />
                </div>
            </div>

            {/* 정렬된 리스트 출력 */}
            <ul className="divide-y divide-gray-700">
                {sortedList.map((item) => {
                    const { nftMetadata, startPrice, highestBid } = item;
                    const start = Number(startPrice);
                    const highest = Number(highestBid ?? startPrice);
                    const diffPercent = ((highest - start) / start * 100).toFixed(1);
                    const diffColor =
                        Number(diffPercent) > 0
                            ? "text-green-400"
                            : Number(diffPercent) < 0
                                ? "text-red-400"
                                : "text-gray-400";

                    return (
                        <li
                            key={item.id}
                            className="flex items-center justify-between px-3 py-3 rounded hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            {/* 왼쪽: 썸네일 + 이름 + 타이머 */}
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="flex flex-col items-start">
                                    <img
                                        src={nftMetadata.image}
                                        alt={nftMetadata.name}
                                        className="w-10 h-10 object-cover rounded"
                                    />
                                    <span className="text-[9px] text-gray-400 mt-1">
                                        <CountdownTimerSmallImage endTime={item.endAt} />
                                    </span>
                                </div>

                                <p className="text-sm text-white truncate max-w-[140px]">
                                    {nftMetadata.name}
                                </p>
                            </div>

                            {/* 오른쪽: 가격 + 상승률 */}
                            <div className="text-right min-w-[72px]">
                                <div className="text-white text-sm font-semibold">
                                    {highest} <span className="text-xs text-gray-400">ATK</span>
                                </div>
                                <div className={`text-xs ${diffColor}`}>
                                    {Number(diffPercent) > 0 ? "+" : ""}
                                    {diffPercent}%
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}

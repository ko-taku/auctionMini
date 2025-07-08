import { useNFTList } from "../hooks/useNFTList";
import { usePagination } from "../hooks/usePagination";
import '../css/index.css';

export default function NFTListPage() {
    const { nftList, loading } = useNFTList();
    const { currentPage, totalPages, currentData, goToPage } = usePagination(nftList, 9);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <p className="text-gray-300 text-lg">Loading NFTs...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-12">
            <h1 className="text-4xl font-bold text-center text-gray-100 mb-10">NFT 리스트</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {currentData.map((nft) => (
                    <div
                        key={nft.tokenId}
                        className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden flex flex-col"
                    >
                        <div className="h-64 bg-gray-700 overflow-hidden rounded-t-xl">
                            <img
                                src={nft.metadata.image}
                                alt={nft.metadata.name}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="flex flex-col p-4 flex-1">
                            <h3 className="text-lg font-bold text-gray-100 mb-2">{nft.metadata.name}</h3>
                            <p className="text-gray-400 mb-4 text-sm line-clamp-3">{nft.metadata.description}</p>
                            <div className="mt-4 border-t border-gray-700 pt-4 text-sm text-gray-400">
                                <div className="grid gap-y-2"
                                    style={{ gridTemplateColumns: '25% 75%' }}>
                                    <div className="pr-2 text-center text-gray-300 break-words">발행자</div>
                                    <div className="pl-2 break-words">{nft.minter}</div>

                                    <div className="pr-2 text-center text-gray-300 break-words">발행 날짜</div>
                                    <div className="pl-2 break-words">{nft.mintedAt}</div>

                                    <div className="pr-2 text-center text-gray-300 break-words">소유자</div>
                                    <div className="pl-2 break-words">{nft.owner}</div>

                                    <div className="pr-2 text-center text-gray-300 break-words">Token ID</div>
                                    <div className="pl-2 break-words">{nft.tokenId}</div>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center space-x-2 mt-14">
                {/* << */}
                <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className={`px-5 py-3 rounded ${currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-600 text-gray-200'}`}
                >
                    «
                </button>

                {/* < */}
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-5 py-3 rounded ${currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-600 text-gray-200'}`}
                >
                    ‹
                </button>

                {/* Numbered pages */}
                {[...Array(totalPages).keys()].map((i) => {
                    const page = i + 1;
                    return (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-5 py-3 rounded ${page === currentPage
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-gray-800 hover:bg-gray-600 text-gray-200'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}

                {/* > */}
                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-5 py-3 rounded ${currentPage === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-600 text-gray-200'}`}
                >
                    ›
                </button>

                {/* >> */}
                <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-5 py-3 rounded ${currentPage === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-600 text-gray-200'}`}
                >
                    »
                </button>
            </div>

        </div>
    );
}

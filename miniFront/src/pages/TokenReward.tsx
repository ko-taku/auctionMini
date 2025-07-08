import { useClaimState } from '../hooks/useClaimState';
import '../css/index.css';

export function TokenReward() {
    const {
        loadingEngage,
        loadingAuction,
        totalClaimEngage,
        totalClaimAuction,
        handleEngage,
        handleAuction,
    } = useClaimState();

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-gray-100">
            <h1 className="text-3xl font-bold mb-8">Daily Token Reward</h1>

            <div className="flex flex-col space-y-4 mb-8 w-full max-w-sm">
                <button
                    onClick={handleEngage}
                    disabled={loadingEngage}
                    className={`py-3 rounded-lg font-semibold transition ${loadingEngage
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                        }`}
                >
                    {loadingEngage ? '진행 중...' : 'Engage 출석 보상'}
                </button>

                <button
                    onClick={handleAuction}
                    disabled={loadingAuction}
                    className={`py-3 rounded-lg font-semibold transition ${loadingAuction
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {loadingAuction ? '진행 중...' : 'Auction 출석 보상'}
                </button>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-sm">
                <div className="mb-2">
                    총 받은 Engag 보상 횟수: <span className="font-bold">{totalClaimEngage}</span>
                </div>
                <div>
                    총 받은 Auction 보상 횟수: <span className="font-bold">{totalClaimAuction}</span>
                </div>
            </div>
        </div>
    );
}
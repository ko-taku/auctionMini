import { useClaimState } from '../hooks/useClaimState';

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
        <div>
            <button onClick={handleEngage} disabled={loadingEngage}>
                {loadingEngage ? '진행 중...' : '🎁 Engage 출석 보상 받기'}
            </button>

            <button onClick={handleAuction} disabled={loadingAuction}>
                {loadingAuction ? '진행 중...' : '🎁 Auction 출석 보상 받기'}
            </button>

            <div>
                <div>✅ 총 받은 Engage 횟수: {totalClaimEngage}</div>
                <div>✅ 총 받은 Auction 횟수: {totalClaimAuction}</div>
            </div>
        </div>
    );
}

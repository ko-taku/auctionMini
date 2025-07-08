import { useState } from 'react';
import { useClaim } from './useClaim';

export function useClaimState() {
    const { claimEngage, claimAuction } = useClaim();

    const [loadingEngage, setLoadingEngage] = useState(false);
    const [loadingAuction, setLoadingAuction] = useState(false);

    const [totalClaimEngage, setTotalClaimEngage] = useState<number | null>(null);
    const [totalClaimAuction, setTotalClaimAuction] = useState<number | null>(null);

    const handleEngage = async () => {
        setLoadingEngage(true);
        try {
            const res = await claimEngage();
            alert("✅ Engage 출석 완료!");
            setTotalClaimEngage(res.totalClaimEngage ?? null);
        } catch (err) {
            alert(`❌ 오류: ${(err as Error).message}`);
        } finally {
            setLoadingEngage(false);
        }
    };

    const handleAuction = async () => {
        setLoadingAuction(true);
        try {
            const res = await claimAuction();
            alert("✅ Auction 출석 완료!");
            setTotalClaimAuction(res.totalClaimAuction ?? null);
        } catch (err) {
            alert(`❌ 오류: ${(err as Error).message}`);
        } finally {
            setLoadingAuction(false);
        }
    };

    return {
        loadingEngage,
        loadingAuction,
        totalClaimEngage,
        totalClaimAuction,
        handleEngage,
        handleAuction,
    };
}

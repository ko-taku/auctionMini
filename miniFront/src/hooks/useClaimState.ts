import { useState, useEffect } from 'react';
import { useClaim } from './useClaim';
import { useAuthContext } from "../contexts/AuthContext";

export function useClaimState() {
    const { claimEngage, claimAuction } = useClaim();
    const { token } = useAuthContext();

    const [loadingEngage, setLoadingEngage] = useState(false);
    const [loadingAuction, setLoadingAuction] = useState(false);

    const [totalClaimEngage, setTotalClaimEngage] = useState<number | null>(null);
    const [totalClaimAuction, setTotalClaimAuction] = useState<number | null>(null);


    // ✅ 1️⃣ 최초 마운트 시 서버에서 내 출석 상태 fetch
    useEffect(() => {
        const fetchMyClaimStatus = async () => {
            if (!token) return;
            try {
                const res = await fetch("http://localhost:3000/claim/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setTotalClaimEngage(data.totalClaimEngage ?? 0);
                setTotalClaimAuction(data.totalClaimAuction ?? 0);
            } catch (err) {
                console.error("❌ 출석 상태 가져오기 실패:", err);
            }
        };

        fetchMyClaimStatus();
    }, [token]);

    const handleEngage = async () => {
        setLoadingEngage(true);
        try {
            const res = await claimEngage();
            console.log('성공?: ', res);
            alert("✅ Engage 출석 완료!");
            setTotalClaimEngage((prev => (prev ?? 0) + 1));
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
            console.log('성공?: ', res);
            alert("✅ Auction 출석 완료!");
            setTotalClaimAuction((prev => (prev ?? 0) + 1));
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

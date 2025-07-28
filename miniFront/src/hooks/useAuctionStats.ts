import { useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

interface DailyStat {
    date: string;
    formattedDate: string;
    registrations: number;
    totalBids: number;
    totalBidCount: number;
    highestBid: number;
    uniqueUsers: number;
    avgUserMaxBid: number;
}

interface TodayTopAuction {
    auction_id: number;
    nft_name: string;
    nft_image: string;
    highest_bid: number;
}

export function useAuctionStats() {
    const { token } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
    const [todayHighestBid, setTodayHighestBid] = useState<number>(0);
    const [todayTopAuction, setTodayTopAuction] = useState<TodayTopAuction | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;

            setLoading(true);
            try {
                const res = await fetch('http://localhost:3000/auction/stats/overview', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error(await res.text());

                const data = await res.json();

                // 날짜 포맷을 "7월 27일" 형태로 변환
                const formatted = data.dailyStats.map((item: any) => {
                    const date = new Date(item.date);
                    const formattedDate = date.toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                    });

                    return {
                        date: item.date,
                        formattedDate,
                        registrations: Number(item.registrations),
                        totalBids: Number(item.totalBids),           // ✅ FIXED
                        totalBidCount: Number(item.totalBidCount),  // ✅ FIXED
                        highestBid: Number(item.highestBid),         // ✅ FIXED
                        uniqueUsers: Number(item.uniqueUsers),       // ✅ FIXED
                        avgUserMaxBid: Number(item.avgUserMaxBid ?? 0), // ✅ FIXED

                    };
                });

                setDailyStats(formatted);
                setTodayHighestBid(Number(data.todayHighestBid));
                setTodayTopAuction(data.todayTopAuction ?? null);
            } catch (err) {
                console.error('❌ useAuctionStats 오류:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    return {
        loading,
        dailyStats,         // ✅ 차트 데이터
        todayHighestBid,    // ✅ 숫자 카드
        todayTopAuction     // ✅ NFT 정보 카드
    };
}

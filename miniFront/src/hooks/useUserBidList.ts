import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";

export function useUserBidsList() {
    const { jwtAddress, token } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bids, setBids] = useState<any[]>([]);

    useEffect(() => {
        const fetchBids = async () => {
            if (!jwtAddress || !token) return;
            setLoading(true);
            try {
                const res = await fetch("http://localhost:3000/bid/mybidlist", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setBids(data);
            } catch (err: any) {
                setError(err.message || "에러 발생");
            } finally {
                setLoading(false);
            }
        };

        fetchBids();
    }, [jwtAddress, token]);

    return { bids, loading, error };
}

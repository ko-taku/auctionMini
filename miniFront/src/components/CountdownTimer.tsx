import React, { useEffect, useState } from "react";

type CountdownTimerProps = {
    endTime: string; // ISO string
};

export default function CountdownTimer({ endTime }: CountdownTimerProps) {
    const [remaining, setRemaining] = useState<string>("");

    useEffect(() => {
        const update = () => {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setRemaining("⏰ 종료됨");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setRemaining(`${hours}시간 ${minutes}분 ${seconds}초`);
        };

        update(); // 초기 실행
        const interval = setInterval(update, 1000); // 매 초마다 갱신

        return () => clearInterval(interval);
    }, [endTime]);

    return <span>{remaining}</span>;
}

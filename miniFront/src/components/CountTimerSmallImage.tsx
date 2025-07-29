import React, { useEffect, useState } from "react";

type CountdownTimerProps = {
    endTime: string; // ISO string
};

export default function CountdownTimerSmallImage({ endTime }: CountdownTimerProps) {
    const [remaining, setRemaining] = useState<string>("");

    useEffect(() => {
        const update = () => {
            const end = new Date(endTime).getTime();
            const now = Date.now();
            const diff = end - now;

            if (diff <= 0) {
                setRemaining("⏰ 종료됨");
                return;
            }

            const totalSec = Math.floor(diff / 1000);
            const hours = Math.floor(totalSec / 3600);
            const minutes = Math.floor((totalSec % 3600) / 60);
            const seconds = totalSec % 60;

            const h = hours.toString().padStart(2, "0");
            const m = minutes.toString().padStart(2, "0");
            const s = seconds.toString().padStart(2, "0");

            if (hours >= 1) {
                setRemaining(`${h}:${m}:${s}`);
            } else {
                setRemaining(`${m}:${s}`);
            }
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return <span>{remaining}</span>;
}

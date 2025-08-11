// components/SortToolbar.tsx
import React from "react";
import type { SortType } from "../hooks/useAuctionSort";
import {
    Clock,
    DollarSign,
    Flame,
    Hourglass,
    Square,
} from "lucide-react";

interface SortToolbarProps {
    selected: SortType;
    onChange: (sort: SortType) => void;
}

const iconMap: Record<SortType, React.ElementType> = {
    time: Hourglass,
    latest: Clock,
    price: DollarSign,
    active: Flame,
    ended: Square,
};

const labelMap: Record<SortType, string> = {
    time: "마감임박순",
    latest: "등록순",
    price: "가격순",
    active: "경매중",
    ended: "종료",
};

export function SortToolbar({ selected, onChange }: SortToolbarProps) {
    const options: SortType[] = ["time", "latest", "price", "active", "ended"];

    return (
        <div className="flex gap-2 translate-y-[5px] mb-2">
            {options.map((key) => {
                const Icon = iconMap[key];
                const label = labelMap[key];
                return (
                    <button
                        key={key}
                        title={label}
                        onClick={() => onChange(selected === key ? "time" : key)}
                        className={`p-1 rounded transition-colors ${selected === key
                            ? "bg-white/10 text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <Icon size={18} strokeWidth={1.5} />
                    </button>
                );
            })}
        </div>
    );
}

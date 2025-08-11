// components/BettingSortToolbar.tsx
import { Trophy, DollarSign, SlidersHorizontal } from "lucide-react";
import type { BettingSortType } from "../hooks/useBettingSort";

interface BettingSortToolbarProps {
    selected: BettingSortType;
    onChange: (sort: BettingSortType) => void;
}

const iconMap: Record<BettingSortType, React.ElementType> = {
    "price-desc": DollarSign,
    "price-asc": Trophy,
    "accuracy": SlidersHorizontal,
};

const labelMap: Record<BettingSortType, string> = {
    "price-desc": "낙찰가순 ▼",
    "price-asc": "당첨가순 ▲",
    "accuracy": "예측 정확도순",
};

export function BettingSortToolbar({ selected, onChange }: BettingSortToolbarProps) {
    const options: BettingSortType[] = ["price-desc", "price-asc", "accuracy"];

    return (
        <div className="flex gap-2 translate-y-[5px] mb-2">
            {options.map((key) => {
                const Icon = iconMap[key];
                const label = labelMap[key];
                return (
                    <button
                        key={key}
                        title={label}
                        onClick={() => {
                            if (key === "price-desc" || key === "price-asc") {
                                onChange(selected === "price-desc" ? "price-asc" : "price-desc");
                            } else {
                                onChange(key);
                            }
                        }}
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

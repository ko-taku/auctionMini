// src/components/ui/badge.tsx
import React from "react";

type Props = {
    children: React.ReactNode;
    variant?: "default" | "destructive";
};

export function Badge({ children, variant = "default" }: Props) {
    const baseStyle =
        "inline-block px-2 py-0.5 text-xs font-semibold rounded-full";
    const variantStyle =
        variant === "destructive"
            ? "bg-red-500 text-white"
            : "bg-gray-600 text-white";

    return <span className={`${baseStyle} ${variantStyle}`}>{children}</span>;
}

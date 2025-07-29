import { useEffect } from "react";
import type { RefObject } from "react";

export function useSlashSearchFocus(inputRef: RefObject<HTMLInputElement | null>) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
                e.preventDefault();
                inputRef.current?.focus(); // ✅ null-safe 호출
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [inputRef]);
}
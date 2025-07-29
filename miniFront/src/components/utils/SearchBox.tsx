import { useRef } from "react";
import { useSlashSearchFocus } from "../../hooks/useSlashSearchFocus";

export function SearchBox({
    searchQuery,
    setSearchQuery,
}: {
    searchQuery: string;
    setSearchQuery: (v: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    useSlashSearchFocus(inputRef); // ✅ 단축키로 focus

    return (
        <div className="relative max-w-xl mx-auto mb-8">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.6 3.6a7.5 7.5 0 0012.85 12.85z"
                    />
                </svg>
            </span>
            <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Auctions"
                className="w-full pl-10 pr-12 py-2 rounded-md bg-[#111] border border-[#333] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <kbd className="text-gray-500 text-sm border border-gray-600 px-1 rounded">/</kbd>
            </div>
        </div>
    );
}

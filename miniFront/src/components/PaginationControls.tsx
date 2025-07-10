import React from "react";

type PaginationControlsProps = {
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
};

export default function PaginationControls({
    currentPage,
    totalPages,
    goToPage,
}: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center space-x-2 mt-14">
            {/* << */}
            <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className={`px-5 py-3 rounded ${currentPage === 1
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-600 text-gray-200"
                    }`}
            >
                «
            </button>

            {/* < */}
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-5 py-3 rounded ${currentPage === 1
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-600 text-gray-200"
                    }`}
            >
                ‹
            </button>

            {/* Numbered pages */}
            {[...Array(totalPages).keys()].map((i) => {
                const page = i + 1;
                return (
                    <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-5 py-3 rounded ${page === currentPage
                            ? "bg-blue-600 text-white font-bold"
                            : "bg-gray-800 hover:bg-gray-600 text-gray-200"
                            }`}
                    >
                        {page}
                    </button>
                );
            })}

            {/* > */}
            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-5 py-3 rounded ${currentPage === totalPages
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-600 text-gray-200"
                    }`}
            >
                ›
            </button>

            {/* >> */}
            <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-5 py-3 rounded ${currentPage === totalPages
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-600 text-gray-200"
                    }`}
            >
                »
            </button>
        </div>
    );
}

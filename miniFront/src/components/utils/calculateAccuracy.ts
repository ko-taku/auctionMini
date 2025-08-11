// src/utils/calculateAccuracy.ts
export function calculateAccuracy(predicted: number, final: number): string {
    if (final === 0) return "N/A";

    const diff = Math.abs(predicted - final);
    const accuracy = Math.max(0, 100 - (diff / final) * 100);

    return `${accuracy.toFixed(1)}%`;
}

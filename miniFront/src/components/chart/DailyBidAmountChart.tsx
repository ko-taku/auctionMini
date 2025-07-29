// components/Chart/DailyBidAmountChart.tsx
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Tooltip,
    Legend,
    Filler, // ✅ 이거 추가
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ScriptableContext } from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { useAuctionStats } from '../../hooks/useAuctionStats';
import { defaultLineChartOptions } from '../utils/chartOptions';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Tooltip,
    Legend,
    Filler, // ✅ 이거 추가
);

export function DailyBidAmountChart() {
    const { dailyStats } = useAuctionStats();

    const data = {
        labels: dailyStats.map((item) => item.formattedDate),
        datasets: [
            {
                label: '총 입찰 금액',
                data: dailyStats.map((item) => item.totalBids),
                borderColor: '#a855f7',
                backgroundColor: (ctx: ScriptableContext<'line'>) => {
                    const chart = ctx.chart;
                    const { ctx: canvas, chartArea } = chart;
                    if (!chartArea) return 'rgba(168, 85, 247, 0.2)'; // fallback

                    const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
                    gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
                    return gradient;
                },
                fill: true,
                tension: 0.5,
                pointRadius: 0,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        ...defaultLineChartOptions,
        plugins: {
            ...defaultLineChartOptions.plugins,
            tooltip: {
                ...defaultLineChartOptions.plugins?.tooltip,
                callbacks: {
                    ...defaultLineChartOptions.plugins?.tooltip?.callbacks,
                    label: (tooltipItem: TooltipItem<'line'>) =>
                        `총 입찰액: ${tooltipItem.parsed.y} ATK`,
                },
            },
        },
    };

    return (
        <div className="bg-gray-900 rounded-xl shadow p-6 min-h-[320px]">
            <h2 className="text-lg font-bold mb-2 text-white">total volume</h2>
            <Line data={data} options={options} />
        </div>
    );
}

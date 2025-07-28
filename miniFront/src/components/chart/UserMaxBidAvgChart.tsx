import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ScriptableContext, TooltipItem } from 'chart.js';
import { useAuctionStats } from '../../hooks/useAuctionStats';
import { defaultLineChartOptions } from '../utils/chartOptions';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Tooltip,
    Legend
);

export function UserMaxBidAvgChart() {
    const { dailyStats } = useAuctionStats();

    const data = {
        labels: dailyStats.map((d) => d.formattedDate),
        datasets: [
            {
                label: '평균 최대 입찰가',
                data: dailyStats.map((d) => d.avgUserMaxBid),
                fill: true,
                borderColor: '#f87171', // red-400
                backgroundColor: (ctx: ScriptableContext<'line'>) => {
                    const chart = ctx.chart;
                    const { ctx: canvas, chartArea } = chart;
                    if (!chartArea) return 'rgba(248, 113, 113, 0.2)';
                    const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(248, 113, 113, 0.4)');
                    gradient.addColorStop(1, 'rgba(248, 113, 113, 0)');
                    return gradient;
                },
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
                        `평균 최대 입찰가: ${tooltipItem.parsed.y} ACTK`,
                },
            },
        },
    };

    return (
        <div className="bg-gray-900 rounded-xl shadow p-6 min-h-[320px]">
            <h2 className="text-lg font-bold mb-2 text-white">유저 평균 최대 입찰가</h2>
            <Line data={data} options={options} />
        </div>
    );
}

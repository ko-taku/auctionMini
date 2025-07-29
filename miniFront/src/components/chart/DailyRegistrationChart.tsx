import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Tooltip,
    Legend,
    Filler,
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
    Legend,
    Filler
);

export function DailyRegistrationChart() {
    const { dailyStats } = useAuctionStats();

    const data = {
        labels: dailyStats.map((d) => d.formattedDate),
        datasets: [
            {
                label: '등록 수',
                data: dailyStats.map((d) => d.registrations),
                fill: true,
                borderColor: '#10b981', // emerald-500
                backgroundColor: (ctx: ScriptableContext<'line'>) => {
                    const chart = ctx.chart;
                    const { ctx: canvas, chartArea } = chart;
                    if (!chartArea) return 'rgba(16, 185, 129, 0.2)';
                    const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
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
                        `경매 등록 수: ${tooltipItem.parsed.y}`,
                },
            },
        },
    };

    return (
        <div className="bg-gray-900 rounded-xl shadow p-6 min-h-[320px]">
            <h2 className="text-lg font-bold mb-2 text-white">auction amount</h2>
            <Line data={data} options={options} />
        </div>
    );
}

import type { ChartOptions, ScriptableContext, TooltipItem } from 'chart.js';

export const defaultLineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
        mode: 'index',       // ✅ x축 기준
        intersect: false     // ✅ 선에 가까우면 활성화
    },
    animation: {
        duration: 1000,
        easing: 'easeInOutQuart',
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index',
            backgroundColor: '#1f2937',
            titleColor: '#f3f4f6',
            bodyColor: '#f3f4f6',
            cornerRadius: 6,
            padding: 10,
            callbacks: {
                label: (tooltipItem: TooltipItem<'line'>) =>
                    `${tooltipItem.dataset.label}: ${tooltipItem.parsed.y}`,
                title: (items: TooltipItem<'line'>[]) =>
                    `📅 ${items[0].label}`,
            },
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: {
                color: '#9ca3af',
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 7,
            },
        },
        y: {
            grid: { display: false },
            ticks: {
                display: false,
            },
        },
    }
}

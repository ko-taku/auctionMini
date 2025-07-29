// components/Chart/ChartCarousel.tsx
import Slider from 'react-slick';
import { DailyBidCountChart } from './DailyBidCountChart';
import { DailyBidAmountChart } from './DailyBidAmountChart';
import { DailyHighestBidChart } from './DailyHighestBidChart';
import { DailyRegistrationChart } from './DailyRegistrationChart';
import { UserMaxBidAvgChart } from './UserMaxBidAvgChart';


import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export function ChartCarousel() {
    const settings = {
        dots: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 8000, // 10초
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        appendDots: (dots: React.ReactNode) => (
            <div style={{ bottom: '-10px' }}>
                <ul style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>{dots}</ul>
            </div>
        ),
        customPaging: (_i: number) => (
            <div
                style={{
                    width: '20px',
                    height: '4px',
                    borderRadius: '2px',
                    background: '#9ca3af',
                    opacity: 0.5,
                    transition: 'all 0.3s ease-in-out',
                }}
            />
        ),
    };

    return (
        <div className="w-full max-w-full overflow-hidden bg-gray-900 rounded-xl px-2 py-4">
            <Slider {...settings}>
                <div className="w-full">
                    <DailyRegistrationChart />
                </div>
                <div className="w-full">
                    <DailyBidCountChart />
                </div>
                <div className="w-full">
                    <DailyBidAmountChart />
                </div>
                <div className="w-full">
                    <DailyHighestBidChart />
                </div>
                <div className="w-full">
                    <UserMaxBidAvgChart />
                </div>
            </Slider>
        </div>
    );
}

import React from "react";
import Slider from "react-slick";
import BettingCard from "./BettingCard";
import type { AuctionItem } from "../types/AuctionItem";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type Props = {
    items: AuctionItem[];
};

export default function HorizontalBettingCarousel({ items }: Props) {
    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        appendDots: (dots: React.ReactNode) => (
            <div style={{ marginTop: "-8px" }}>
                <ul style={{ display: "flex", justifyContent: "center", gap: "8px" }}>{dots}</ul>
            </div>
        ),
        customPaging: (_i: number) => (
            <div
                style={{
                    width: "20px",
                    height: "4px",
                    borderRadius: "2px",
                    background: "#9ca3af",
                    opacity: 0.5,
                    transition: "all 0.3s ease-in-out",
                }}
            />
        ),
    };

    if (!items.length) {
        return (
            <div className="text-gray-400 text-center mt-6">
                진행 중인 배팅이 없습니다.
            </div>
        );
    }

    return (
        <Slider {...settings}>
            {items.map((auction) => (
                <div key={auction.id} className="px-2">
                    <BettingCard auction={auction} />
                </div>
            ))}
        </Slider>
    );
}

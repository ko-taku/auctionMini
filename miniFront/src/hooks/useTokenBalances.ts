import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../contexts/WalletContext";
import { useAuth } from "./useAuth";
import AuctionTokenABI from "../abi/AuctionToken.json";
import EngageTokenABI from "../abi/EngageToken.json";

const AUCTION_TOKEN = import.meta.env.VITE_AUCTION_TOKEN_ADDRESS;
const ENGAGE_TOKEN = import.meta.env.VITE_ENGAGE_TOKEN_ADDRESS;

export function useTokenBalance() {
    const { provider, wallet } = useWallet();
    const { jwtAddress } = useAuth();

    const [loading, setLoading] = useState(false);
    const [auctionBalance, setAuctionBalance] = useState("0");
    const [engageBalance, setEngageBalance] = useState("0");

    useEffect(() => {
        if (!jwtAddress || !provider) return;

        (async () => {
            setLoading(true);
            try {
                const signer = provider ? await provider.getSigner() : wallet!;
                const engage = new ethers.Contract(ENGAGE_TOKEN, EngageTokenABI.abi, signer);
                const auction = new ethers.Contract(AUCTION_TOKEN, AuctionTokenABI.abi, signer);

                const [engageBal, auctionBal] = await Promise.all([
                    engage.balanceOf(jwtAddress),
                    auction.balanceOf(jwtAddress),
                ]);

                setEngageBalance(ethers.formatUnits(engageBal, 18));
                setAuctionBalance(ethers.formatUnits(auctionBal, 18));
            } finally {
                setLoading(false);
            }
        })();
    }, [jwtAddress]);

    return {
        loading,
        engageBalance,
        auctionBalance,
        setEngageBalance,
        setAuctionBalance,
    };
}

import { useAuthContext } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";
import { ethers } from "ethers";
import { useState } from "react";
import { FunctionFragment } from "ethers";

import PredictionBettingJson from "../abi/PredictionBetting.json";

export function usePlaceBetting() {
    const { token, jwtAddress } = useAuthContext();
    const { provider, wallet, address } = useWallet();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const BETTING_CONTRACT = import.meta.env.VITE_PREDICTION_BETTING_ADDRESS!;
    const FORWARDER_ADDRESS = import.meta.env.VITE_FORWARDER_ADDRESS!;

    const placeBet = async (params: {
        auctionId: number;
        predictedPrice: number;
        tier: number; // 1, 2, 3
    }) => {
        console.log("🟢 placeBet() called with", params);
        setLoading(true);
        setError(null);

        try {
            if (!address) throw new Error("지갑이 연결되어 있지 않습니다.");
            if (!token || !jwtAddress) throw new Error("로그인이 필요합니다.");
            if (jwtAddress.toLowerCase() !== address.toLowerCase()) {
                throw new Error("로그인한 지갑과 연결된 지갑이 다릅니다.");
            }

            const signer = provider ? await provider.getSigner() : wallet!;
            const effectiveProvider = provider ?? wallet?.provider;
            if (!effectiveProvider) throw new Error("Provider가 없습니다.");

            const chainId = (await effectiveProvider.getNetwork()).chainId;
            const deadline = Math.floor(Date.now() / 1000) + 3600;

            // ✅ 1. nonce 예약
            const reserveRes = await fetch(`http://localhost:3000/bet/reserve`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ forwarder: FORWARDER_ADDRESS }),
            });
            if (!reserveRes.ok) throw new Error(await reserveRes.text());
            const { nonce: forwarderNonce } = await reserveRes.json();

            // ✅ 2. calldata 생성
            const iface = new ethers.Interface(PredictionBettingJson.abi);
            const dataEncoded = iface.encodeFunctionData("placeBet", [
                BigInt(params.auctionId),
                BigInt(params.predictedPrice),
                params.tier,
            ]);

            // ✅ 3. ForwardRequest 구조체 + 서명 생성
            const request = {
                from: jwtAddress,
                to: BETTING_CONTRACT,
                value: 0,
                gas: 300_000,
                nonce: forwarderNonce,
                deadline,
                data: dataEncoded,
            };

            const metaDomain = {
                name: "AuctionSystem",
                version: "1",
                chainId,
                verifyingContract: FORWARDER_ADDRESS,
            };
            const metaTypes = {
                ForwardRequest: [
                    { name: "from", type: "address" },
                    { name: "to", type: "address" },
                    { name: "value", type: "uint256" },
                    { name: "gas", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint48" },
                    { name: "data", type: "bytes" },
                ],
            };
            const metaSignature = await signer.signTypedData(metaDomain, metaTypes, request);

            // ✅ 4. relay 요청
            const relayRes = await fetch(`http://localhost:3000/bet/relay`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    forwarder: FORWARDER_ADDRESS,
                    request,
                    signature: metaSignature,
                }),
            });

            if (!relayRes.ok) throw new Error(await relayRes.text());
            return await relayRes.json();

        } catch (e: any) {
            console.error("❌ Error in placeBet:", e);
            setError(e?.message ?? "배팅 실패");
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return { placeBet, loading, error };
}

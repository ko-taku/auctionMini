import { useAuthContext } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";
import { ethers } from "ethers";
import { useState } from "react";
import { FunctionFragment } from "ethers";

import AuctionManagerJson from "../abi/AuctionManager.json";

export function useBidRegister() {
    const { token, jwtAddress } = useAuthContext();
    const { provider, wallet, address } = useWallet();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const AUCTION_MANAGER_ADDRESS = import.meta.env.VITE_AUCTION_MANAGER_ADDRESS;
    const FORWARDER_ADDRESS = import.meta.env.VITE_FORWARDER_ADDRESS;
    const AUCTION_TOKEN = import.meta.env.VITE_AUCTION_TOKEN_ADDRESS;

    const registerBidWithPermit = async (params: {
        auctionId: number;
        amount: string;
    }) => {
        console.log('✅ Calling registerBidWithPermit with params:', params);
        setError(null);
        setLoading(true);
        try {
            if (!address) throw new Error("지갑이 연결되어 있지 않습니다.");
            if (!token || !jwtAddress) throw new Error("로그인이 필요합니다.");
            if (jwtAddress.toLowerCase() !== address.toLowerCase()) {
                throw new Error("로그인한 지갑과 현재 연결된 지갑이 다릅니다.");
            }

            const signer = provider ? await provider.getSigner() : wallet!;
            const effectiveProvider = provider ?? wallet?.provider;
            if (!effectiveProvider) throw new Error("Provider가 없습니다.");

            const tokenContract = new ethers.Contract(AUCTION_TOKEN, [
                "function name() view returns (string)",
                "function nonces(address) view returns (uint256)",
            ], signer);

            const tokenName = await tokenContract.name();
            const nonce = await tokenContract.nonces(address);
            const amountParsed = ethers.parseUnits(params.amount, 18);
            const deadline = Math.floor(Date.now() / 1000) + 3600;

            // ✅ 1. permit 서명 생성
            const chainId = (await effectiveProvider.getNetwork()).chainId;
            const domain = {
                name: tokenName,
                version: "1",
                chainId,
                verifyingContract: AUCTION_TOKEN,
            };
            const types = {
                Permit: [
                    { name: "owner", type: "address" },
                    { name: "spender", type: "address" },
                    { name: "value", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" },
                ],
            };
            const value = {
                owner: address,
                spender: AUCTION_MANAGER_ADDRESS,
                value: amountParsed.toString(),
                nonce: nonce.toString(),
                deadline: deadline.toString(),
            };

            const signature = await signer.signTypedData(domain, types, value);
            console.log("🖊️ raw signature:", signature); // ✅ 이거 먼저!
            const { v, r, s } = ethers.Signature.from(signature);

            console.log("🔐 서명 결과:", {
                v: v,
                r: r,
                s: s,
            });

            // ✅ 2. nonce 예약
            const reserveRes = await fetch(`http://localhost:3000/bid/reserve`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "content-Type": 'application/json',
                },
                body: JSON.stringify({ forwarder: FORWARDER_ADDRESS }),
            });
            if (!reserveRes.ok) throw new Error(await reserveRes.text());
            const { nonce: forwarderNonce } = await reserveRes.json();

            // ✅ 3. calldata 생성
            const iface = new ethers.Interface(AuctionManagerJson.abi);
            console.log(
                iface.fragments
                    .filter((f): f is FunctionFragment => f.type === "function")
                    .map((f) => f.name)
            );

            console.log("📦 bidWithPermit calldata params", {
                auctionId: params.auctionId,
                amountParsed,
                deadline,
                v, r, s,
            });


            const dataEncoded = iface.encodeFunctionData("bidWithPermit", [
                BigInt(params.auctionId),
                amountParsed,
                deadline,
                v, r, s,
            ]);

            console.log("📦 encoded calldata:", dataEncoded);
            console.log("📏 encoded data length:", dataEncoded.length);

            // ✅ 4. ForwardRequest 서명
            const request = {
                from: jwtAddress,
                to: AUCTION_MANAGER_ADDRESS,
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

            // ✅ 5. relay 요청
            const relayRes = await fetch(`http://localhost:3000/bid/relay`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
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
            console.error("❌ Error in registerBidWithPermit:", e);
            setError(e?.message ?? "등록 실패");
            if (e?.reason) {
                console.error("❗️Reason:", e.reason);
            }
            if (e?.message) {
                console.error("❗️Message:", e.message);
            }
            if (e?.info?.error?.message) {
                console.error("🧨 Revert reason (nested):", e.info.error.message);
            }

            throw e;
        } finally {
            setLoading(false);
        }
    };

    return { registerBid: registerBidWithPermit, loading, error };
}

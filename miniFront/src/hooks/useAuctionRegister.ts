import { useAuthContext } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";
import { ethers } from "ethers";
import { useState } from "react";

import AuctionManagerJson from "../abi/AuctionManager.json";
import NFTContractABI from "../abi/NFTContract.json";

export function useAuctionRegister() {
    const { token, jwtAddress } = useAuthContext();
    const { provider, wallet, address } = useWallet();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const AUCTION_MANAGER_ADDRESS = import.meta.env.VITE_AUCTION_MANAGER_ADDRESS;
    const FORWARDER_ADDRESS = import.meta.env.VITE_FORWARDER_ADDRESS;

    /**
   * ✅ 1️⃣ escrow 처리
   */
    const escrowNFT = async (contractAddress: string, tokenId: string) => {
        console.log("✅ Starting escrow transfer");
        setLoading(true);
        const effectiveProvider = provider ?? wallet?.provider;
        if (!effectiveProvider) throw new Error("Provider가 없습니다.");
        const signer = provider ? await provider.getSigner() : wallet!;

        const nftContract = new ethers.Contract(
            contractAddress,
            NFTContractABI,
            signer
        );

        console.log("nft컨트랙트: ", contractAddress);

        // ① approve
        console.log("✅ Checking approval status...");
        const owner = await nftContract.ownerOf(tokenId);
        console.log(`✅ Owner of token ${tokenId}:`, owner);
        const approvedAddress = await nftContract.getApproved(tokenId);
        if (approvedAddress.toLowerCase() !== AUCTION_MANAGER_ADDRESS.toLowerCase()) {
            console.log(`✅ Not yet approved. Sending approve tx for ${tokenId}...`);
            const approveTx = await nftContract.approve(AUCTION_MANAGER_ADDRESS, tokenId);
            console.log(`✅ Approve Tx sent: ${approveTx.hash}`);
            await approveTx.wait();
            console.log(`✅ Approve Tx mined: ${approveTx.hash}`);
        } else {
            console.log("✅ Already approved!");
        }

        // ② transfer
        console.log(`✅ Transferring token ${tokenId} to AuctionManager`);
        const transferTx = await nftContract.transferFrom(
            await signer.getAddress(),
            AUCTION_MANAGER_ADDRESS,
            tokenId
        );
        await transferTx.wait();
        console.log(`✅ Transfer TxHash: ${transferTx.hash}`);

        console.log("✅ Escrow completed.");
    };

    const registerAuction = async (params: {
        contractAddress: string;
        tokenId: string;
        startPrice: string;
        minIncrement: string;
        days: string;
        hours: string;
        minutes: string;
    }) => {
        console.log('✅ Calling registerAuction with params:', {
            params
        });
        setError(null);
        setLoading(true);
        try {
            if (!address) throw new Error("지갑이 연결되어 있지 않습니다.");
            if (!token || !jwtAddress) throw new Error("로그인이 필요합니다.");

            if (jwtAddress.toLowerCase() !== address.toLowerCase()) {
                throw new Error("로그인한 지갑과 현재 연결된 지갑이 다릅니다. 같은 지갑으로 로그인해주세요.");
            }

            // ✅ 1️⃣ 서버 reserve 요청
            const reserveRes = await fetch(`http://localhost:3000/auction/reserve`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "content-Type": 'application/json',
                },
                body: JSON.stringify({
                    forwarder: FORWARDER_ADDRESS
                }),
            });
            if (!reserveRes.ok) throw new Error(await reserveRes.text());
            const { nonce } = await reserveRes.json();
            console.log(`✅ Reserved nonce: ${nonce}`);

            // ✅ 2️⃣ duration 계산
            const d = parseInt(params.days) || 0;
            const h = parseInt(params.hours) || 0;
            const m = parseInt(params.minutes) || 0;
            const duration = (d * 86400) + (h * 3600) + (m * 60);

            if (duration <= 59) throw new Error("기간을 1분 이상 입력해주세요!");
            if (duration > 7 * 86400) throw new Error("기간은 최대 7일까지 가능합니다!");

            // ✅ 3️⃣ calldata 생성
            const iface = new ethers.Interface(AuctionManagerJson.abi);


            const dataEncoded = iface.encodeFunctionData("createAuction", [
                params.contractAddress,
                params.tokenId,
                ethers.parseUnits(params.startPrice, 18),
                ethers.parseUnits(params.minIncrement, 18),
                duration
            ]);

            console.log('✅ Constructing 데이터 인코디드 with:', {
                dataEncoded
            });
            // ✅ 4️⃣ ForwardRequest 생성
            const effectiveProvider = provider ?? wallet?.provider;
            if (!effectiveProvider) throw new Error("지갑 Provider가 없습니다.");
            const signer = provider ? await provider.getSigner() : wallet!;

            const deadline = Math.floor(Date.now() / 1000) + 3600;

            const request = {
                from: jwtAddress,
                to: AUCTION_MANAGER_ADDRESS,
                value: 0,
                gas: 300_000,
                nonce,
                deadline,
                data: dataEncoded
            };

            // ✅ 5️⃣ EIP-712 서명
            const chainId = (await effectiveProvider.getNetwork()).chainId;
            const domain = {
                name: "AuctionSystem",
                version: "1",
                chainId,
                verifyingContract: FORWARDER_ADDRESS,
            };
            const types = {
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
            const signature = await signer.signTypedData(domain, types, request);
            console.log(`✅ Signature: ${signature}`);

            console.log('✅ Sending relay request body:', {
                request,
                signature
            });

            // ✅ 6️⃣ 서버 relay 요청
            const relayRes = await fetch(`http://localhost:3000/auction/relay`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    forwarder: FORWARDER_ADDRESS,
                    request,
                    signature
                })
            });
            if (!relayRes.ok) throw new Error(await relayRes.text());

            return await relayRes.json();

        } catch (e: any) {
            console.error("❌ Error in registerAuction:", e);
            setError(e?.message ?? "등록 실패");
            throw e;
        } finally {
            setLoading(false);
        }
    };

    /**
   * ✅ 3️⃣ escrow + 메타트랜잭션 통합
   */
    const escrowAndRegister = async (params: {
        contractAddress: string;
        tokenId: string;
        startPrice: string;
        minIncrement: string;
        days: string;
        hours: string;
        minutes: string;
    }) => {
        console.log("✅ escrowAndRegister called with:", params);

        await escrowNFT(params.contractAddress, params.tokenId);
        console.log("✅ Escrow 완료");

        const result = await registerAuction(params);
        console.log("✅ Auction 등록 완료:", result);

        return result;
    };

    return { escrowAndRegister, loading, error };
}

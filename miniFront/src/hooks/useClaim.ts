import { useAuthContext } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";
import { ethers } from "ethers";

export function useClaim() {

    const { token, jwtAddress } = useAuthContext();
    const { provider, wallet, address } = useWallet();
    if (!address) throw new Error("지갑이 연결되어 있지 않습니다.");

    const claim = async (type: 'engage' | 'auction') => {
        if (!token || !jwtAddress) throw new Error("로그인이 필요합니다.");

        if (jwtAddress.toLowerCase() !== address.toLowerCase()) {
            throw new Error("로그인한 지갑과 현재 연결된 지갑이 다릅니다. 같은 지갑으로 로그인해주세요.");
        }

        // ✅ 1️⃣ 서버에서 reserve → nonce 받기
        const reserveRes = await fetch(`http://localhost:3000/claim/${type}/reserve`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!reserveRes.ok) throw new Error(await reserveRes.text());
        const { nonce } = await reserveRes.json();

        console.log(`✅ Reserved nonce: ${nonce}`);

        // ✅ 2️⃣ 클라이언트에서 request 생성
        const effectiveProvider = provider ?? wallet?.provider;
        if (!effectiveProvider) throw new Error("지갑 Provider가 없습니다.");
        const signer = provider ? await provider.getSigner() : wallet!;

        // ✅ 출석 컨트랙트 주소
        const attendanceContractAddress = import.meta.env.VITE_ATTENDANCE_ADDRESS;
        const forwarderAddress = import.meta.env.VITE_FORWARDER_ADDRESS;

        // 출석 보상 함수 이름
        const claimMethod = type === 'engage' ? 'claimEngage' : 'claimAuction';

        // ABI encode
        const AttendanceABI = [
            "function claimEngage()",
            "function claimAuction()"
        ];
        const attendanceIface = new ethers.Interface(AttendanceABI);
        const dataEncoded = attendanceIface.encodeFunctionData(claimMethod);

        // deadline
        const deadline = Math.floor(Date.now() / 1000) + 3600;

        // request
        const request = {
            from: jwtAddress,
            to: attendanceContractAddress,
            value: 0,
            gas: 100_000,
            nonce,
            deadline,
            data: dataEncoded,
        };

        // ✅ Domain
        const chainId = (await effectiveProvider.getNetwork()).chainId;
        const domain = {
            name: "AuctionSystem",
            version: "1",
            chainId,
            verifyingContract: forwarderAddress,
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

        // ✅ signTypedData
        const signature = await signer.signTypedData(domain, types, request);
        console.log(`✅ Signature: ${signature}`);

        // ✅ 3️⃣ 서버에 relay 요청
        const relayRes = await fetch(`http://localhost:3000/claim/${type}/relay`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                forwarder: forwarderAddress,
                request,
                signature
            })
        });
        if (!relayRes.ok) throw new Error(await relayRes.text());
        return await relayRes.json();
    };

    const claimEngage = async () => await claim('engage');
    const claimAuction = async () => await claim('auction');

    return { claimEngage, claimAuction };
}

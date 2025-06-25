import { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import MetamaskHelp from '../components/MetamaskHelp';
import type { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider;
    }
}

const MainPage = () => {
    const [address, setAddress] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<string[]>([]);
    const navigate = useNavigate();

    const connectWithMetamask = async () => {
        if (!window.ethereum) {
            alert("Metamask가 설치되어 있지 않습니다.");
            return;
        }

        try {
            const selectedAccounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            if (Array.isArray(selectedAccounts) && selectedAccounts.length > 0) {
                setAccounts(selectedAccounts); // 여러 계정 저장
                setAddress(null);                     // ✅ 선택은 나중에
            }
        } catch (err) {
            console.error(err);
            alert("지갑 연결에 실패했습니다.");
        }
    };

    const connectWithPrivateKey = async () => {
        const privateKey = prompt("지갑의 private key를 입력하세요:");
        if (!privateKey) return;

        try {
            const provider = ethers.getDefaultProvider();
            const wallet = new ethers.Wallet(privateKey, provider);
            setAddress(wallet.address);
            setAccounts([]); // 기존 계정 초기화
        } catch (err) {
            alert("잘못된 private key입니다.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
            <h1 className="text-2xl font-bold">NFT 등록 시스템</h1>

            <button
                onClick={connectWithMetamask}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow"
            >
                🦊 Metamask로 연결
            </button>

            <button
                onClick={connectWithPrivateKey}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-2xl shadow"
            >
                🔑 Private Key로 연결
            </button>

            {/* ✅ 계정 선택 UI */}
            {accounts.length > 0 && (
                <div className="mt-4">
                    <label htmlFor="account-select" className="block mb-2 font-semibold">
                        사용할 계정을 선택하세요:
                    </label>
                    <select
                        id="account-select"
                        onChange={(e) => setAddress(e.target.value)}
                        className="px-4 py-2 border rounded-md shadow-sm"
                        value={address ?? ''}
                    >
                        <option value="" disabled>-- 계정 선택 --</option>
                        {accounts.map((acc) => (
                            <option key={acc} value={acc}>
                                {acc}
                            </option>
                        ))}
                    </select>

                    {/* 👇 설명 컴포넌트 삽입 */}
                    <MetamaskHelp />
                </div>
            )}

            {address && <p className="mt-4 text-green-600">선택된 지갑: {address}</p>}
            <button
                onClick={() => navigate('/auction')}
                className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-2xl shadow"
            >
                🎯 경매 페이지로 이동
            </button>
        </div>
    );
};

export default MainPage;

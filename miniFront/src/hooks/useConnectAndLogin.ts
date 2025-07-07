import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from './useAuth';

export function useConnectAndLogin() {
    const { SignMessage, address } = useWallet();
    const { login } = useAuth();

    // 상태: 연결 여부
    const [connected, setConnected] = useState(false);
    const [loggingIn, setLoggingIn] = useState(false);

    // 1️⃣ 단순 지갑 연결
    const connect = async (connectFunc: () => Promise<void>) => {
        await connectFunc();
    };

    // 2️⃣ 서버 로그인
    const loginWithAddress = async (address: string) => {
        await login(address, SignMessage);
    };

    // 3️⃣ ⭐️ 단계별 처리까지 통합
    const handleConnectAndLogin = async (connectFunc: () => Promise<void>) => {
        try {
            if (!connected) {
                // 연결 단계
                await connect(connectFunc);
                setConnected(true);
            } else {
                // 로그인 단계
                if (!address) {
                    alert("계정을 선택해주세요!");
                    return;
                }
                setLoggingIn(true);
                await loginWithAddress(address);
                alert("✅ 로그인 완료!");
            }
        } catch (err) {
            console.error('❌ 실패:', err);
            alert('❌ 실패: ' + (err as Error).message);
        } finally {
            setLoggingIn(false);
        }
    };

    return {
        connected,
        loggingIn,
        connect,
        loginWithAddress,
        handleConnectAndLogin,
    };
}

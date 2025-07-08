import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from './useAuth';

export function useConnectAndLogin() {
    const { SignMessage, address, setAddress, setAccounts } = useWallet();
    const { login, logout } = useAuth();

    // 상태: 연결 여부
    const [connected, setConnected] = useState(false);
    const [loggingIn, setLoggingIn] = useState(false);

    const [selectedMethod, setSelectedMethod] = useState<null | 'metamask' | 'privateKey'>(null);

    // 1️⃣ 단순 지갑 연결
    const connect = async (connectFunc: () => Promise<void>) => {
        await connectFunc();
    };

    // 2️⃣ 서버 로그인
    const loginWithAddress = async (address: string) => {
        await login(address, SignMessage);
    };

    // 3️⃣ ⭐️ 단계별 처리까지 통합
    const handleConnectAndLogin = async (method: 'metamask' | 'privateKey', connectFunc: () => Promise<void>) => {
        try {

            setSelectedMethod(method);

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

    const resetSelectedMethod = () => {
        setConnected(false);
        setLoggingIn(false);
        setSelectedMethod(null);
        // ✅ 컨텍스트 상태도 초기화
        setAddress(null);
        setAccounts([]);
        logout();

    };


    return {
        connected,
        loggingIn,
        selectedMethod,
        connect,
        loginWithAddress,
        handleConnectAndLogin,
        resetSelectedMethod,
    };
}

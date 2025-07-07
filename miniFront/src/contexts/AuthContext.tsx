import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

/**
 * JWT Payload 타입 정의
 *  - address: 로그인 지갑 주소
 *  - exp: 만료 시간(초 단위)
*/
type JwtPayload = {
    address: string;
    exp?: number;
};

/**
 * AuthContext가 제공할 타입 정의
 * - token: 현재 로그인 토큰(JWT)
 * - setToken: 토큰을 저장하거나 제거하는 함수
 * - logout: 로그아웃 (토큰 제거) 함수
 */
type AuthContextType = {
    token: string | null;
    jwtAddress: string | null;
    setToken: (token: string | null) => void;
    logout: () => void;
};

// ✅ 실제 Context 객체 생성 (초기값은 undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//localStorage 키 상수
const STORAGE_KEY = 'jwt';

/**
 * AuthProvider 컴포넌트
 * - 이걸 App.tsx에서 최상단을 감싸면
 * - 모든 하위 컴포넌트에서 useAuthContext()를 통해 로그인 상태 사용 가능
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ✅ JWT 토큰 상태를 useState로 관리
    const [token, setTokenState] = useState<string | null>(null);
    const [jwtAddress, setJwtAddress] = useState<string | null>(null);

    /**
     * 토큰 저장 + 디코딩 address 추출
     * - localStorage 동기화까지 처리
     * - 다른 컴포넌트에서 setToken() 호출하면 자동 저장됨
     */
    const setToken = (token: string | null) => {
        if (token) {
            localStorage.setItem(STORAGE_KEY, token);
            setTokenState(token);

            try {
                // ✅ 라이브러리 방식
                //const payload = jwtDecode<JwtPayload>(token);
                const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
                setJwtAddress(payload.address);
            } catch {
                setJwtAddress(null);
            }
        } else {
            localStorage.removeItem(STORAGE_KEY);
            setTokenState(null);
            setJwtAddress(null);
        }
    };

    /**
     * ✅ 컴포넌트가 처음 마운트 될 때
     * - localStorage에 저장된 JWT가 있으면 불러옴
     * - 페이지 새로고침에도 로그인 유지 효과
     */
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setTokenState(saved);
            try {
                // ✅ 라이브러리 방식
                //const payload = jwtDecode<JwtPayload>(token);
                const payload = JSON.parse(atob(saved.split('.')[1])) as JwtPayload;
                setJwtAddress(payload.address);
            } catch (e) {
                console.error('JWT 디코드 실패', e);
                setJwtAddress(null);
            }
        }
    }, []);

    /**
     * ✅ 토큰을 설정하거나 제거하는 함수
     * - localStorage 동기화까지 처리
     * - 다른 컴포넌트에서 setToken() 호출하면 자동 저장됨
     */
    // const setToken = (token: string | null) => {
    //     if (token) {
    //         localStorage.setItem('jwt', token);
    //         setTokenState(token);
    //     } else {
    //         localStorage.removeItem('jwt');
    //         setTokenState(null);
    //     }
    // };

    /**
     * ✅ 로그아웃 함수
     * - 단순히 토큰을 제거하는 역할
     */
    const logout = () => setToken(null);

    return (
        // ✅ Context Provider로 전역에 상태를 공급
        <AuthContext.Provider value={{ token, jwtAddress, setToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * ✅ 커스텀 훅: useAuthContext
 * - AuthContext를 쉽게 사용하게 해줌
 * - 안전하게 undefined 체크 포함
 */
export const useAuthContext = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return ctx;
};

// useAuth.ts
import { useEffect, useCallback } from "react";
import { useAuthContext } from "../contexts/AuthContext";


const CHECK_INTERVAL_MS = 60 * 1000 //1분

export function useAuth() {
    const { token, jwtAddress, setToken, logout } = useAuthContext();

    //JWT 파싱해서 exp 가져오기
    const getTokenExp = (jwt: string): number | null => {
        try {
            //JWT에서 만료 시간을 꺼내서 비교, jwt는 header, payload, signature 3개로 구분된 Base64 문자열, 그 중 payload를 필요
            //atob : base64로 인코딩된걸 디코드, JSON.parse : 문자열 형태의 JSON을 진짜 객체로 파싱
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            return payload.exp ? payload.exp * 1000 : null;
        } catch {
            return null;
        }
    }

    //토큰 만료 확인
    //token이 바뀌면 이 함수도 새로 생성, logout이 바뀌면 이 함수 새로 생성
    const checkTokenExpiration = useCallback(() => {
        if (!token) return;
        const exp = getTokenExp(token);
        if (exp && Date.now() >= exp) {
            console.log("JWT 만료 확인됨, 자동 로그아웃 처리 합니다");
            logout();
        }
    }, [token, logout]);


    //주기적 만료 체크
    useEffect(() => {
        const interval = setInterval(checkTokenExpiration, CHECK_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [checkTokenExpiration]);

    //로그인
    const login = async (address: string, signMessage: (message: string) => Promise<string>) => {
        const message = "로그인을 위해 서명해주세요.";
        const signature = await signMessage(message);

        const res = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, signature }),
        });

        if (!res.ok) throw new Error("서버 로그인 실패");

        const data = await res.json();
        if (data.token) {
            setToken(data.token); //context에서 제공하는 setToken만 호출
        } else {
            throw new Error("로그인 실패");
        }
    }

    return { token, jwtAddress, login, logout };

}

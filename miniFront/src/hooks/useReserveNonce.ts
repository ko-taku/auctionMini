export async function reserveNonce({
    forwarderAddress,
    jwtAddress,
    token
}: {
    forwarderAddress: string;
    jwtAddress: string;
    token: string;
}): Promise<number> {

    //JWT 가져오기
    if (!token) {
        throw new Error('JWT 토큰이 없습니다. 로그인 먼저 해주세요');
    }

    //Authrization 헤더 추가
    const res = await fetch("http://localhost:3000/meta/nonce/reserve", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ forwarder: forwarderAddress, user: jwtAddress }),
    });

    if (!res.ok) {

        if (res.status === 401) {
            throw new Error("인증 오류: 로그인 토큰이 유효하지 않습니다");
        }
        throw new Error(`Nonce reservation failed: ${res.status}`);
    }
    const data = await res.json();
    return data.nonce;
}

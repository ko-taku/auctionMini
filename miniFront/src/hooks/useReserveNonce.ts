export async function reserveNonce({
    forwarderAddress,
    userAddress
}: {
    forwarderAddress: string;
    userAddress: string;
}): Promise<number> {
    const res = await fetch("http://localhost:3000/meta/nonce/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forwarder: forwarderAddress, user: userAddress }),
    });

    if (!res.ok) throw new Error("Nonce reservation failed");

    const data = await res.json();
    return data.nonce;
}

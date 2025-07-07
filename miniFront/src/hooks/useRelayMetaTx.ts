export async function relayMetaTransaction({
    forwarderAddress,
    request,
    signature,
    token
}: {
    forwarderAddress: string;
    request: any;
    signature: string;
    token: string;
}): Promise<{ txHash: string }> {
    const res = await fetch("http://localhost:3000/meta/relay", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ forwarder: forwarderAddress, request, signature }),
    });

    if (!res.ok) throw new Error("Relay failed");

    return await res.json();
}

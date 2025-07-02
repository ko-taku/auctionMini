export async function uploadNFTToPinata({
    image,
    title,
    description,
    category,
    attributes,
    userAddress
}: {
    image: File;
    title: string;
    description: string;
    category: string;
    attributes: { trait_type: string; value: string }[];
    userAddress: string;
}): Promise<{
    image: string;
    tokenURI: string;
    userAddress: string;
}> {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("name", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("attributes", JSON.stringify(attributes));
    formData.append("userAddress", userAddress);

    const res = await fetch("http://localhost:3000/pinata/upload", {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    return await res.json();
}

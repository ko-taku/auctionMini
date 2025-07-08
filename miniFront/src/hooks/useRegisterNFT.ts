import { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { ethers } from "ethers";
import MinimalForwarderABI from "../abi/MinimalForwarder.json";
import NFtContractABI from "../abi/NFTContract.json";
import { uploadNFTToPinata } from "./useUploadNFT";
import { reserveNonce } from "./useReserveNonce";
import { relayMetaTransaction } from "./useRelayMetaTx";
import { useAuth } from "./useAuth";

export function useRegisterNFT() {
    const [image, setImage] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("art");
    const [attributes, setAttributes] = useState([
        { trait_type: "", value: "" },
    ]);
    const { address, wallet, provider } = useWallet();
    const { token, jwtAddress } = useAuth();

    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!image || !title || !description || !address) {
            alert("모든 항목을 입력해주세요.");
            return;
        }
        setIsSubmitting(true);
        try {
            // ✅ 1️⃣ Pinata 업로드
            const pinataResult = await uploadNFTToPinata({
                image,
                title,
                description,
                category,
                attributes,
                userAddress: address,
            });

            console.log("✅ Pinata 업로드 성공:", pinataResult);

            // ✅ 2️⃣ EIP-712 ForwardRequest 준비
            const effectiveProvider = provider ?? wallet?.provider;
            if (!effectiveProvider) throw new Error("Provider가 없습니다");
            const signer = provider ? await provider.getSigner() : wallet!;

            const nftContract = new ethers.Contract(
                import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
                NFtContractABI,
                effectiveProvider
            );

            const forwarderAddress = import.meta.env.VITE_FORWARDER_ADDRESS;

            // mint 함수 encode
            const dataEncoded = nftContract.interface.encodeFunctionData("mint", [pinataResult.tokenURI]);


            if (!jwtAddress || !token) {
                alert("로그인이 필요합니다.");
                return;
            }


            // ✅ 3️⃣ 서버에서 예약된 nonce 받기
            const nonce = await reserveNonce({
                forwarderAddress,
                jwtAddress,
                token
            });

            console.log("✅ Reserved Nonce:", nonce);

            // ✅ 4️⃣ ForwardRequest 생성
            const deadline = Math.floor(Date.now() / 1000) + 3600;
            const request = {
                from: jwtAddress,
                to: import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
                value: 0,
                gas: 500000,
                nonce,
                deadline,
                data: dataEncoded,
            };

            // ✅ 5️⃣ EIP-712 도메인
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

            // ✅ 6️⃣ 서명 생성
            const signature = await signer.signTypedData(domain, types, request);
            console.log("✅ Signature:", signature);

            // ✅ 7️⃣ 서버에 relay
            const relayResult = await relayMetaTransaction({
                forwarderAddress,
                request,
                signature,
                token
            });

            console.log("✅ Relay 성공:", relayResult);
            alert(`NFT 민팅 성공! TxHash : ${relayResult.txHash}`);

        } catch (err) {
            console.error(err);
            alert("업로드 실패" + (err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        image,
        isSubmitting,
        title,
        description,
        category,
        attributes,
        setTitle,
        setDescription,
        setCategory,
        handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setImage(file);
                setImagePreviewUrl(URL.createObjectURL(file));
            }
        },
        handleAttributeChange: (index: number, field: "trait_type" | "value", value: string) => {
            const updated = [...attributes];
            updated[index][field] = value;
            setAttributes(updated);
        },
        handleAddAttribute: () => setAttributes([...attributes, { trait_type: "", value: "" }]),
        handleRemoveAttribute: (index: number) => setAttributes(attributes.filter((_, i) => i !== index)),
        handleSubmit,
        imagePreviewUrl,
    };
}

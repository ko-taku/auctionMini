import { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { ethers } from "ethers";
import type { Signer } from "ethers";
import MinimalForwarderABI from "../abi/MinimalForwarder.json";
import NFtContractABI from "../abi/NFTContract.json";

export type Attribute = {
    trait_type: string;
    value: string;
};

const NFT_CONTRACT_ADDRESS = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
const FORWARDER_ADDRESS = import.meta.env.VITE_FORWARDER_ADDRESS;

export function useRegisterNFT() {
    const [image, setImage] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("art");
    const [attributes, setAttributes] = useState<Attribute[]>([
        { trait_type: "", value: "" },
    ]);
    const { address, wallet, provider } = useWallet();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleAttributeChange = (
        index: number,
        field: "trait_type" | "value",
        value: string
    ) => {
        const updated = [...attributes];
        updated[index][field] = value;
        setAttributes(updated);
    };

    const handleAddAttribute = () => {
        setAttributes([...attributes, { trait_type: "", value: "" }]);
    };

    const handleRemoveAttribute = (index: number) => {
        const updated = attributes.filter((_, i) => i !== index);
        setAttributes(updated);
    };

    const handleSubmit = async () => {
        if (!image || !title || !description || !address) {
            alert("모든 항목을 입력해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("file", image);
        formData.append("name", title);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("attributes", JSON.stringify(attributes));
        formData.append("userAddress", address);

        try {
            const res = await fetch("http://localhost:3000/pinata/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            console.log("등록 성공: ", data);
            console.log("✅ 서버에서 반환한 userAddress:", data.userAddress);
            alert(`NFT 등록 완료! tokenURI: ${data.tokenURI},
          파일uri : ${data.image}`
            );

            let signer: Signer;
            if (provider) {
                signer = await provider.getSigner();
            } else if (wallet) {
                signer = wallet;
            } else {
                throw new Error("지갑 연결 정보가 없습니다");
            }

            const forwarderContract = new ethers.Contract(
                FORWARDER_ADDRESS,
                MinimalForwarderABI,
                provider || wallet?.provider
                //옵셔널 체이닝 연산자
                //provider 있으면 그걸 쓰고 없을 때 wallet 있으면 wallet.provider, null이면 undefined
            );

            const nftContract = new ethers.Contract(
                NFT_CONTRACT_ADDRESS,
                NFtContractABI,
                provider || wallet?.provider
            );

            //mint 함수 인코딩
            const dataEncoded = nftContract.interface.encodeFunctionData("mint", [data.tokenURI]);
            console.log("Encoded mint data: ", dataEncoded);

            const deadline = Math.floor(Date.now() / 1000) + 3600; // 1시간 유효

            //ForwardRequest 객체 생성
            const request = {
                from: address,
                to: NFT_CONTRACT_ADDRESS,
                value: "0",
                gas: "500000",
                deadline: deadline.toString(),
                data: dataEncoded,
            };
            console.log("ForwardRequest: ", request);

            // ✅ 먼저 provider를 확실히 선택
            const effectiveProvider = provider ?? wallet?.provider;
            if (!effectiveProvider) {
                throw new Error("Provider가 연결되지 않았습니다.");
            }

            const chainId = (await effectiveProvider.getNetwork()).chainId;
            //getNetwork()는 undefined에서 메서드 호출이 안됨

            const domain = {
                name: "AuctionSystem",              // ✅ 컨트랙트에서 정의한 이름
                version: "1",                       // ✅ 너가 정한 버전
                chainId,                            // ✅ 연결된 체인의 ID
                verifyingContract: FORWARDER_ADDRESS, // ✅ 배포한 Forwarder 주소
            };

            const types = {
                ForwardRequest: [
                    { name: "from", type: "address" },
                    { name: "to", type: "address" },
                    { name: "value", type: "uint256" },
                    { name: "gas", type: "uint256" },
                    { name: "deadline", type: "uint48" },
                    { name: "data", type: "bytes" },
                ],
            };

            //사용자 지갑으로 서명 요청
            const signature = await signer.signTypedData(domain, types, request);
            console.log("Signature: ", signature);

            //서버에 relay 요청
            const relayRes = await fetch("http://localhost:3000/pinata/relay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ request, signature }),
            });

            const relayData = await relayRes.json();
            console.log("Relayed Tx Hash: ", relayData.txHash);
            alert(`NFT 민팅 성공! TxHash : ${relayData.txHash}`);





        } catch (err) {
            console.error(err);
            alert("업로드 실패");
        }
    };

    return {
        image,
        title,
        description,
        category,
        attributes,
        setTitle,
        setDescription,
        setCategory,
        handleImageChange,
        handleAttributeChange,
        handleAddAttribute,
        handleRemoveAttribute,
        handleSubmit,
    };
}

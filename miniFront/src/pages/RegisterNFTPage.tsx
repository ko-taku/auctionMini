import { useState } from "react";

const RegisterNFTPage = () => {
    const [image, setImage] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("art");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (!image || !title || !description) {
            alert("모든 항목을 입력해주세요.");
            return;
        }

        // 👉 이 시점에서 Pinata 업로드 및 민팅 로직이 들어갈 예정
        console.log("제목:", title);
        console.log("설명:", description);
        console.log("카테고리:", category);
        console.log("이미지:", image.name);
        alert("등록 준비 완료 (콘솔을 확인하세요)");
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">NFT 등록</h1>

            <div className="mb-4">
                <label className="block font-medium mb-1">이미지 업로드</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {image && <p className="mt-2 text-sm text-gray-600">선택됨: {image.name}</p>}
            </div>

            <div className="mb-4">
                <label className="block font-medium mb-1">제목</label>
                <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block font-medium mb-1">설명</label>
                <textarea
                    className="w-full border rounded px-3 py-2"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block font-medium mb-1">카테고리</label>
                <select
                    className="w-full border rounded px-3 py-2"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="art">예술</option>
                    <option value="music">음악</option>
                    <option value="collectible">수집품</option>
                </select>
            </div>

            <button
                onClick={handleSubmit}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded"
            >
                ✅ NFT 등록
            </button>
        </div>
    );
};

export default RegisterNFTPage;

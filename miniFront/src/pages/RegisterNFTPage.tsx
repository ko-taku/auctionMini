import "../css/RegisterNFTPage.css";
import { useRegisterNFT } from "../hooks/useRegisterNFT";

const RegisterNFTPage = () => {
    const {
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
    } = useRegisterNFT();

    return (
        <div className="register-nft-wrapper">
            <h1 className="register-nft-title">NFT 등록</h1>

            <div className="nft-form-section">
                <label>이미지 업로드</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="nft-image-input" />
                {image && <p className="nft-selected-filename">선택됨: {image.name}</p>}
            </div>

            <div className="nft-form-section">
                <label>제목</label>
                <input
                    type="text"
                    className="nft-text-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className="nft-form-section">
                <label>설명</label>
                <textarea
                    className="nft-textarea"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="nft-form-section">
                <label>카테고리</label>
                <select
                    className="nft-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="art">예술</option>
                    <option value="music">음악</option>
                    <option value="collectible">수집품</option>
                </select>
            </div>

            <div className="nft-form-section">
                <label>속성 (Attributes)</label>
                {attributes.map((attr, index) => (
                    <div key={index} className="nft-attribute-row">
                        <input
                            type="text"
                            className="nft-text-input"
                            placeholder="속성 이름 (trait_type)"
                            value={attr.trait_type}
                            onChange={(e) => handleAttributeChange(index, "trait_type", e.target.value)}
                        />
                        <input
                            type="text"
                            className="nft-text-input"
                            placeholder="속성 값 (value)"
                            value={attr.value}
                            onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                        />
                        <button type="button" onClick={() => handleRemoveAttribute(index)} className="nft-remove-button">
                            ❌
                        </button>
                    </div>
                ))}
                <button type="button" onClick={handleAddAttribute} className="nft-add-button">
                    ➕ 속성 추가
                </button>
            </div>

            <button onClick={handleSubmit} className="nft-submit-button">
                ✅ NFT 등록
            </button>
        </div>
    );
};

export default RegisterNFTPage;

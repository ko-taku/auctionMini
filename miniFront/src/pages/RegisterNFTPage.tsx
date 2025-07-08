import { useRegisterNFT } from "../hooks/useRegisterNFT";
import '../css/index.css';
import { Listbox } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid'

const categories = [
    { id: 'art', name: '예술' },
    { id: 'music', name: '음악' },
    { id: 'collectible', name: '수집품' },
];


const RegisterNFTPage = () => {
    const {
        image,
        isSubmitting,
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
        imagePreviewUrl,
    } = useRegisterNFT();

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-w-2xl w-full p-8">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">NFT 등록</h1>

                <div className="space-y-6">
                    {/* 이미지 업로드 */}
                    <div>
                        <label className="block text-gray-300 mb-2">이미지 업로드</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-200 file:bg-gray-700 file:border-none file:px-4 file:py-2 file:rounded file:text-gray-200 hover:file:bg-gray-600 transition"
                        />
                        {imagePreviewUrl && (
                            <div className="mt-4">
                                <img
                                    src={imagePreviewUrl}
                                    alt="미리보기"
                                    className="max-h-64 rounded-lg border border-gray-700 shadow"
                                />
                            </div>
                        )}
                        {image && <p className="mt-2 text-sm text-gray-400">선택됨: {image.name}</p>}
                    </div>

                    {/* 제목 */}
                    <div>
                        <label className="block text-gray-300 mb-2">제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    {/* 설명 */}
                    <div>
                        <label className="block text-gray-300 mb-2">설명</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">카테고리</label>
                        <Listbox value={category} onChange={setCategory}>
                            <div className="relative">
                                <Listbox.Button className="
        relative w-full cursor-default rounded bg-gray-700 border border-gray-600
        py-2 pl-4 pr-10 text-left text-gray-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 transition
      ">
                                    <span className="block truncate">
                                        {categories.find(c => c.id === category)?.name}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>

                                <Listbox.Options className="
        absolute mt-1 max-h-60 w-full overflow-auto
        rounded bg-gray-800 border border-gray-700 shadow-lg z-10
        focus:outline-none
      ">
                                    {categories.map((item) => (
                                        <Listbox.Option
                                            key={item.id}
                                            value={item.id}
                                            className={({ active, selected }) => `
              cursor-pointer select-none relative px-4 py-2
              ${active ? 'bg-gray-700 text-white' : 'text-gray-200'}
            `}
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-semibold' : ''}`}>
                                                        {item.name}
                                                    </span>
                                                    {selected && (
                                                        <span className="absolute inset-y-0 right-4 flex items-center text-blue-400">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                    </div>

                    {/* 속성 */}
                    <div>
                        <label className="block text-gray-300 mb-2">속성 (Attributes)</label>
                        <div className="space-y-4">
                            {attributes.map((attr, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="속성 이름 (trait_type)"
                                        value={attr.trait_type}
                                        onChange={(e) => handleAttributeChange(index, "trait_type", e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                    <input
                                        type="text"
                                        placeholder="속성 값 (value)"
                                        value={attr.value}
                                        onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAttribute(index)}
                                        className="text-red-400 hover:text-red-300 transition"
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddAttribute}
                            className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 transition"
                        >
                            속성 추가
                        </button>
                    </div>

                    {/* 제출 */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`
                                w-full mt-4 px-4 py-3 rounded font-semibold transition
                                ${isSubmitting
                                ? 'bg-gray-500 hover:bg-blue-600 text-gray-300 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'}
                                `}
                    >
                        {isSubmitting ? '처리중...' : 'NFT 등록'}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default RegisterNFTPage;

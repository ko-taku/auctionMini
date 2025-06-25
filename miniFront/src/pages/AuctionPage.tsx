import { useNavigate } from 'react-router-dom';

const AuctionPage = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">경매 페이지</h1>
            <p className="mb-6">여기서 NFT를 등록하고 경매에 참여할 수 있습니다.</p>

            <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 bg-green-600 text-white rounded-xl shadow"
            >
                🖼️ NFT 등록하기
            </button>
        </div>
    );
};

export default AuctionPage;

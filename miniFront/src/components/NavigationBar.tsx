import { Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import '../css/index.css';


const NavigationBar = () => {

    const { address } = useWallet();

    if (!address) {
        return null;  // ✅ 지갑 연결 안되어 있으면 아무것도 안 그림
    }

    return (
        <nav className="bg-black h-14 shadow-md">
            <ul className="flex gap-12 h-full items-stretch pl-8">
                <li>
                    <Link
                        to="/"
                        className="flex items-center justify-center h-full text-gray-100 hover:text-white hover:font-bold transition-colors"
                    >
                        지갑 연결
                    </Link>
                </li>
                <li>
                    <Link
                        to="/auction"
                        className="flex items-center justify-center h-full text-gray-100 hover:text-white hover:font-bold transition-colors"
                    >
                        경매
                    </Link>
                </li>
                <li>
                    <Link
                        to="/register"
                        className="flex items-center justify-center h-full text-gray-100 hover:text-white hover:font-bold transition-colors"
                    >
                        NFT 등록
                    </Link>
                </li>
                <li>
                    <Link
                        to="/nftlist"
                        className="flex items-center justify-center h-full text-gray-100 hover:text-white hover:font-bold transition-colors"
                    >
                        NFT 리스트
                    </Link>
                </li>
                <li>
                    <Link
                        to="/tokenReward"
                        className="flex items-center justify-center h-full text-gray-100 hover:text-white hover:font-bold transition-colors"
                    >
                        Daily 토큰
                    </Link>
                </li>
            </ul>
        </nav>

    );
};

export default NavigationBar;

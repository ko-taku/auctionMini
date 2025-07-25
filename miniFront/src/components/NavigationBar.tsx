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
                        Wallet Connect
                    </Link>
                </li>
                <li>
                    <Link
                        to="/auction"
                        className="flex items-center justify-center h-full text-gray-100 hover:text-white hover:font-bold transition-colors"
                    >
                        Auction
                    </Link>
                </li>
                <li>
                    <Link
                        to="/register"
                        className="flex items-center justify-center h-full text-gray-100 hover:text-white hover:font-bold transition-colors"
                    >
                        NFT Register
                    </Link>
                </li>
                <li>
                    <Link
                        to="/nftlist"
                        className="flex items-center justify-center h-full text-gray-100 hover:text-white hover:font-bold transition-colors"
                    >
                        NFT List
                    </Link>
                </li>
                <li>
                    <Link
                        to="/mynftlist"
                        className="flex items-center justify-center h-full text-gray-100 hover:text-white hover:font-bold transition-colors"
                    >
                        My NFT
                    </Link>
                </li>
                <li>
                    <Link
                        to="/mybidlist"
                        className="flex items-center justify-center h-full text-gray-100 hover:text-white hover:font-bold transition-colors"
                    >
                        My Bid List
                    </Link>
                </li>
                <li>
                    <Link
                        to="/tokenReward"
                        className="flex items-center justify-center h-full text-gray-100 hover:text-white hover:font-bold transition-colors"
                    >
                        Daily Token
                    </Link>
                </li>
            </ul>
        </nav>

    );
};

export default NavigationBar;

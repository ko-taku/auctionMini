import { Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import "./css/NavigationBar.css"; // 선택적으로 CSS 분리

const NavigationBar = () => {

    const { address } = useWallet();

    if (!address) {
        return null;  // ✅ 지갑 연결 안되어 있으면 아무것도 안 그림
    }

    return (
        <nav className="navigation-bar">
            <ul className="navigation-list">
                <li><Link to="/">🏠 메인</Link></li>
                <li><Link to="/auction">🎯 경매</Link></li>
                <li><Link to="/register">🖼️ NFT 등록</Link></li>
            </ul>
        </nav>
    );
};

export default NavigationBar;

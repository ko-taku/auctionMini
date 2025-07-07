import { useWallet } from "../contexts/WalletContext";
import { useAuth } from "../hooks/useAuth";
import { useConnectAndLogin } from "../hooks/useConnectAndLogin";
import MetamaskHelp from '../components/MetamaskHelp';
import "../css/MainPage.css";

const MainPage = () => {

    const {
        address,
        accounts,
        setAddress,
        connectWithMetamask,
        connectWithPrivateKey,
    } = useWallet();

    const { token, logout } = useAuth();

    const { connected, loggingIn, handleConnectAndLogin } = useConnectAndLogin();

    return (
        <div className="main-page-wrapper">
            <h1 className="main-page-title">NFT 등록 시스템</h1>

            <button
                onClick={() => handleConnectAndLogin(connectWithMetamask)}
                disabled={loggingIn}
                className="connect-button-metamask"
            >
                {connected ? '✅ 선택한 계정으로 로그인' : '🦊 Metamask로 연결'}
            </button>

            <button
                onClick={() => handleConnectAndLogin(connectWithPrivateKey)}
                disabled={loggingIn}
                className="connect-button-privatekey"
            >
                {connected ? '✅ 선택한 계정으로 로그인' : '🔑 Private Key로 연결'}
            </button>

            {accounts.length > 0 && (
                <div className="account-select-section">
                    <label htmlFor="account-select" className="account-select-label">
                        사용할 계정을 선택하세요:
                    </label>
                    <select
                        id="account-select"
                        onChange={(e) => setAddress(e.target.value)}
                        className="account-select-dropdown"
                        value={address ?? ''}
                    >
                        <option value="" disabled>-- 계정 선택 --</option>
                        {accounts.map((acc) => (
                            <option key={acc} value={acc}>
                                {acc}
                            </option>
                        ))}
                    </select>

                    <MetamaskHelp />
                </div>
            )}

            {address && <p className="selected-address">선택된 지갑: {address}</p>}
            {token && (
                <div className="jwt-info">
                    <p>✅ 로그인 완료 (JWT): {token}</p>
                    <button onClick={logout} className="logout-button">
                        로그아웃
                    </button>
                </div>
            )}


        </div>
    );
};

export default MainPage;

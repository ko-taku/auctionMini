import { useWallet } from "../contexts/WalletContext";
import { useAuth } from "../hooks/useAuth";
import { useConnectAndLogin } from "../hooks/useConnectAndLogin";
import MetamaskHelp from '../components/MetamaskHelp';
import '../css/index.css';

const MainPage = () => {
    const {
        address,
        accounts,
        connectWithMetamask,
        connectWithPrivateKey,
    } = useWallet();

    const { token, logout } = useAuth();

    const { connected, loggingIn, selectedMethod, handleConnectAndLogin, resetSelectedMethod } = useConnectAndLogin();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-10">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl w-full max-w-xl p-10 text-center min-h-[80vh]">
                <h1 className="text-4xl font-bold text-gray-50 mb-4">Wallet Connect</h1>
                <p className="text-gray-400 mb-8">지갑을 연결하여 NFT를 발행하세요</p>

                <div className="flex flex-col space-y-4 mb-6">
                    {(selectedMethod === null || selectedMethod === 'metamask') && (
                        <button
                            onClick={() => handleConnectAndLogin('metamask', connectWithMetamask)}
                            disabled={loggingIn}
                            className="w-full py-3 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-md transition disabled:opacity-50"
                        >
                            {connected && selectedMethod === 'metamask'
                                ? '선택한 계정으로 로그인'
                                : 'Metamask'}
                        </button>
                    )}

                    {(selectedMethod === null || selectedMethod === 'privateKey') && (
                        <button
                            onClick={() => handleConnectAndLogin('privateKey', connectWithPrivateKey)}
                            disabled={loggingIn}
                            className="w-full py-3 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md transition disabled:opacity-50"
                        >
                            {connected && selectedMethod === 'privateKey'
                                ? '선택한 계정으로 로그인'
                                : 'Private Key'}
                        </button>
                    )}
                </div>

                {selectedMethod !== null && (
                    <button
                        onClick={resetSelectedMethod}
                        className="w-full py-3 rounded border border-gray-500 text-gray-300 font-medium hover:bg-gray-700 transition mb-6"
                    >
                        다른 방식 선택하기
                    </button>
                )}

                {address && (
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mt-6 text-sm text-gray-200">
                        선택된 지갑: {address}
                    </div>
                )}

                {token && (
                    <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mt-6 text-sm text-blue-300 break-words">
                        <p>✅ 로그인 완료 (JWT): {token}</p>
                        <button
                            onClick={logout}
                            className="w-full py-2 mt-3 rounded bg-gray-500 hover:bg-gray-600 text-white font-bold shadow-md transition"
                        >
                            로그아웃
                        </button>
                    </div>
                )}

                {accounts.length > 1 && (
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mt-6 text-left text-sm text-gray-200">
                        <p className="mb-2 font-semibold">메타마스크 계정 선택</p>
                        <ul className="divide-y divide-gray-600">
                            {accounts.map((acc) => (
                                <li
                                    key={acc}
                                    className={`py-2 ${acc === address ? 'font-bold text-blue-400' : ''}`}
                                >
                                    {acc} {acc === address && '(활성화)'}
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-gray-400 mt-2">
                            계정 변경은 메타마스크 확장에서 직접 선택해주세요
                        </p>
                        <MetamaskHelp />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainPage;

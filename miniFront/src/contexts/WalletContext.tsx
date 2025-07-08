import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import type { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider;
    }
}

type WalletContextType = {
    address: string | null;
    accounts: string[];
    provider: ethers.BrowserProvider | null;
    wallet: ethers.Wallet | null;
    setAddress: React.Dispatch<React.SetStateAction<string | null>>;
    setProvider: React.Dispatch<React.SetStateAction<ethers.BrowserProvider | null>>;
    connectWithMetamask: () => Promise<void>;
    connectWithPrivateKey: () => Promise<void>;
    SignMessage: (message: string) => Promise<string>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [address, setAddress] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<string[]>([]);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [wallet, setWallet] = useState<ethers.Wallet | null>(null);

    const connectWithMetamask = async () => {
        if (!window.ethereum) {
            alert("Metamask가 설치되어 있지 않습니다.");
            return;
        }
        try {
            const newProvider = new ethers.BrowserProvider(window.ethereum);
            await newProvider.send("eth_requestAccounts", []);
            const selectedAccounts = await newProvider.send("eth_accounts", []);

            if (selectedAccounts.length > 0) {
                setAccounts(selectedAccounts);
                setAddress(selectedAccounts[0]);
                setProvider(newProvider);
                setWallet(null);
                console.log("✅ 메타마스크 연결 성공:", selectedAccounts[0]);
            }
        } catch (err) {
            console.error(err);
            alert("지갑 연결에 실패했습니다.");
        }
    };

    const connectWithPrivateKey = async () => {
        const privateKey = prompt("지갑의 private key를 입력하세요:");
        if (!privateKey) return;

        try {
            const rpcProvider = ethers.getDefaultProvider();
            const wallet = new ethers.Wallet(privateKey, rpcProvider);
            setAddress(wallet.address);
            setAccounts([]);
            setWallet(wallet);
            setProvider(null);
        } catch (err) {
            alert("잘못된 private key입니다.");
        }
    };

    const SignMessage = async (message: string): Promise<string> => {
        if (provider) {
            const signer = await provider.getSigner();
            return await signer.signMessage(message);
        } else if (wallet) {
            return await wallet.signMessage(message);
        } else {
            throw new Error("지갑이 연결되어 있지 않습니다");
        }
    }

    /**
     * ✅ 메타마스크 계정 전환 감지
     * - 사용자가 메타마스크에서 계정 변경 시 자동 반영
     */
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (...args: unknown[]) => {
                const accounts = args[0] as string[] | undefined;
                if (accounts && accounts.length > 0) {
                    setAccounts(accounts);
                    setAddress(accounts[0]);
                    console.log("✅ 메타마스크 계정 변경:", accounts[0]);
                } else {
                    setAccounts([]);
                    setAddress(null);
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, []);

    return (
        <WalletContext.Provider
            value={{
                address,
                accounts,
                provider,
                wallet,
                setAddress,
                setProvider,
                connectWithMetamask,
                connectWithPrivateKey,
                SignMessage
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = (): WalletContextType => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
};

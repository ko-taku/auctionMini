import React, { createContext, useContext, useEffect, useState } from "react";
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

            if (Array.isArray(selectedAccounts) && selectedAccounts.length > 0) {
                setAccounts(selectedAccounts);
                setAddress(null);
                setProvider(newProvider);
                setWallet(null);

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

    //메타마스크 계정 자동 복원
    useEffect(() => {
        const tryReconnect = async () => {
            if (window.ethereum) {
                try {
                    const newProvider = new ethers.BrowserProvider(window.ethereum);
                    const existingAccounts = await newProvider.send("eth_accounts", []);
                    if (existingAccounts.length > 0) {
                        setAccounts(existingAccounts);
                        setProvider(newProvider);
                        setWallet(null);
                        console.log("메타마스크 자동 복원: ", existingAccounts);
                    }
                } catch (error) {
                    console.error("메타마스크 자동 복원 실패", error);
                }
            }
        };
        tryReconnect();
    }, []);

    //선택된 address 자동 복원
    useEffect(() => {
        const savedAddress = localStorage.getItem('selectedAddress');
        if (savedAddress) {
            setAddress(savedAddress);
            console.log("저장된 address 복원", savedAddress);
        }
    }, []);

    //address가 바뀔 때 local에 저장
    useEffect(() => {
        if (address) {
            localStorage.setItem('selectedAddress', address);
        } else {
            localStorage.removeItem('selectedAddress');
        }
    }, [address]);

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

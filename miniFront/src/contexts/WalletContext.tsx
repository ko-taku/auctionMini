import React, { createContext, useContext, useState } from "react";
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
                connectWithPrivateKey
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

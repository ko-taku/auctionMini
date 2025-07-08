import React, { createContext, useContext, useState } from 'react';

type JwtPayload = {
    address: string;
    exp?: number;
};

type AuthContextType = {
    token: string | null;
    jwtAddress: string | null;
    setToken: (token: string | null) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'jwt';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setTokenState] = useState<string | null>(null);
    const [jwtAddress, setJwtAddress] = useState<string | null>(null);

    const setToken = (token: string | null) => {
        if (token) {
            localStorage.setItem(STORAGE_KEY, token);
            setTokenState(token);

            try {
                const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
                setJwtAddress(payload.address);
            } catch {
                setJwtAddress(null);
            }
        } else {
            localStorage.removeItem(STORAGE_KEY);
            setTokenState(null);
            setJwtAddress(null);
        }
    };

    const logout = () => setToken(null);

    return (
        <AuthContext.Provider value={{ token, jwtAddress, setToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return ctx;
};

import { EthersProvider } from './ethers.provider';
export declare class MetaService {
    private readonly ethersProvider;
    private reservations;
    constructor(ethersProvider: EthersProvider);
    reserveNonce(forwarderAddress: string, userAddress: string): Promise<number>;
    getOnChainNonce(forwarderAddress: string, userAddress: string): Promise<number>;
    relayMetaTransaction(forwarderAddress: string, request: any, signature: string): Promise<any>;
}

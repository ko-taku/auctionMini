import { MetaService } from './meta.service';
export declare class MetaController {
    private readonly metaService;
    constructor(metaService: MetaService);
    reserveNonce(forwarderAddress: string, userAddress: string): Promise<{
        nonce: number;
    }>;
    getOnChainNonce(forwarderAddress: string, userAddress: string): Promise<{
        nonce: number;
    }>;
    relayMetaTransaction(body: any): Promise<any>;
}

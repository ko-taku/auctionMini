import { ConfigService } from '@nestjs/config';
import { EthersProvider } from './ethers.provider';
export declare class PinataService {
    private readonly configService;
    private readonly ethersProvider;
    constructor(configService: ConfigService, ethersProvider: EthersProvider);
    uploadFileToIPFS(file: Express.Multer.File): Promise<string>;
    uploadMetadataToIPFS(fileUrl: string, metadataInput: {
        name: string;
        description: string;
        attributes: {
            trait_type: string;
            value: any;
        }[];
    }): Promise<string>;
    relayMetaTransaction(request: any, signature: string): Promise<any>;
}

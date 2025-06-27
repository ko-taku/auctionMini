import { PinataService } from './pinata.service';
export declare class PinataController {
    private readonly pinataService;
    constructor(pinataService: PinataService);
    uploadAll(file: Express.Multer.File, name: string, description: string, attributesJson: string, userAddress: string): Promise<{
        image: string;
        tokenURI: string;
        userAddress: string;
    }>;
    relayMetaTransaction(request: any, Signature: string): Promise<any>;
}

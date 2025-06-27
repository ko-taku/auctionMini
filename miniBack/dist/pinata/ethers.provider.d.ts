import { ethers } from "ethers";
import { ConfigService } from "@nestjs/config";
export declare class EthersProvider {
    private configService;
    provider: ethers.JsonRpcProvider;
    wallet: ethers.Wallet;
    constructor(configService: ConfigService);
}

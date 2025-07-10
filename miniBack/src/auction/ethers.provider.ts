import { Injectable } from "@nestjs/common";
import { ethers } from "ethers";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EthersProvider {
    public provider: ethers.JsonRpcProvider;
    public wallet: ethers.Wallet;

    constructor(private configService: ConfigService) {
        const rpcUrl = this.configService.get<string>('RPC_URL');
        const privateKey = this.configService.get<string>('PRIVATE_KEY');

        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
    }
}
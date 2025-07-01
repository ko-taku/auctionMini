"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinataService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
const stream_1 = require("stream");
const uuid_1 = require("uuid");
const MinimalForwarder_json_1 = __importDefault(require("../abis/MinimalForwarder.json"));
const ethers_provider_1 = require("./ethers.provider");
const ethers_1 = require("ethers");
const FormData = require('form-data');
let PinataService = class PinataService {
    constructor(configService, ethersProvider) {
        this.configService = configService;
        this.ethersProvider = ethersProvider;
    }
    async uploadFileToIPFS(file) {
        const jwt = this.configService.get('PINATA_JWT');
        const url = 'https://uploads.pinata.cloud/v3/files';
        const fileName = `image-${(0, uuid_1.v4)()}`;
        const formData = new FormData();
        formData.append('file', stream_1.Readable.from(file.buffer), {
            filename: fileName,
        });
        formData.append('name', fileName);
        formData.append('network', 'public');
        const response = await axios_1.default.post(url, formData, {
            headers: {
                Authorization: `Bearer ${jwt}`,
                ...formData.getHeaders(),
            },
        });
        const cid = response.data.data.cid;
        const fileUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        return fileUrl;
    }
    async uploadMetadataToIPFS(fileUrl, metadataInput) {
        const jwt = this.configService.get('PINATA_JWT');
        const metadata = {
            name: metadataInput.name,
            description: metadataInput.description,
            image: fileUrl,
            attributes: metadataInput.attributes,
        };
        const body = {
            pinataMetadata: { name: metadata.name },
            pinataContent: metadata,
        };
        const response = await axios_1.default.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', body, {
            headers: {
                Authorization: `Bearer ${jwt}`,
                'Content-Type': 'application/json; charset=utf-8',
            },
        });
        const metadataUri = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        return metadataUri;
    }
    async relayMetaTransaction(request, signature) {
        const forwarderAddress = this.configService.get('FORWARDER_ADDRESS');
        const forwarder = new ethers_1.ethers.Contract(forwarderAddress, MinimalForwarder_json_1.default, this.ethersProvider.wallet);
        console.log('✅ Received ForwardRequest:', request);
        console.log('✅ Received Signature:', signature);
        console.log('✅ SERVER Relayer Wallet Address:', this.ethersProvider.wallet.address);
        console.log('✅ SERVER Provider:', this.ethersProvider.provider);
        const network = await this.ethersProvider.provider.getNetwork();
        console.log('✅ SERVER Network:', network);
        console.log('✅ SERVER ChainId:', network.chainId.toString());
        try {
            const network = await this.ethersProvider.provider.getNetwork();
            console.log('✅ SERVER Network:', network);
        }
        catch (err) {
            console.error('❌ Error getting network:', err);
        }
        console.log('✅ Forwarder Address (서버):', forwarderAddress);
        console.log('✅ Relayer Wallet Address (서버):', this.ethersProvider.wallet.address);
        const onChainNonce = await forwarder.nonces(request.from);
        console.log('✅ Forwarder Nonce On-Chain (서버):', onChainNonce.toString());
        const requestWithSignature = {
            ...request,
            signature
        };
        console.log('forwarder.verify 호출...');
        const isValid = await forwarder.verify(requestWithSignature);
        if (!isValid) {
            console.log('x 잘못된 서명입니다');
            throw new Error('잘못된 서명입니다');
        }
        console.log('서명 겸증 성공');
        console.log('forwarder.execute 호출...');
        const tx = await forwarder.execute(requestWithSignature, {
            gasLimit: 500_000,
        });
        console.log('execute 트랜잭션 전송: ', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ Receipt Full Object:', receipt);
        const txHash = receipt?.hash || receipt?.transactionHash || 'UNKNOWN';
        console.log('✅ 트랜잭션 채굴 완료: ', txHash);
        return {
            txHash,
            status: receipt?.status ?? null,
        };
    }
};
exports.PinataService = PinataService;
exports.PinataService = PinataService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        ethers_provider_1.EthersProvider])
], PinataService);
//# sourceMappingURL=pinata.service.js.map
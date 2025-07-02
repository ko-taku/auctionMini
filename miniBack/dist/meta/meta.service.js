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
exports.MetaService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const MinimalForwarder_json_1 = __importDefault(require("../abis/MinimalForwarder.json"));
const ethers_provider_1 = require("./ethers.provider");
let MetaService = class MetaService {
    constructor(ethersProvider) {
        this.ethersProvider = ethersProvider;
        this.reservations = {};
    }
    async reserveNonce(forwarderAddress, userAddress) {
        const forwarder = new ethers_1.ethers.Contract(forwarderAddress, MinimalForwarder_json_1.default, this.ethersProvider.provider);
        const onChainNonce = await forwarder.nonces(userAddress);
        const nonce = Number(onChainNonce);
        if (!this.reservations[userAddress]) {
            this.reservations[userAddress] = {};
        }
        this.reservations[userAddress][forwarderAddress] = nonce;
        console.log(`✅ Reserved nonce=${nonce} for user=${userAddress} on forwarder=${forwarderAddress}`);
        return nonce;
    }
    async getOnChainNonce(forwarderAddress, userAddress) {
        const forwarder = new ethers_1.ethers.Contract(forwarderAddress, MinimalForwarder_json_1.default, this.ethersProvider.provider);
        const nonce = await forwarder.nonces(userAddress);
        return nonce.toNumber();
    }
    async relayMetaTransaction(forwarderAddress, request, signature) {
        const reservedNonce = this.reservations?.[request.from]?.[forwarderAddress];
        if (reservedNonce === undefined) {
            throw new Error(`❌ No reserved nonce for user=${request.from} on forwarder=${forwarderAddress}`);
        }
        if (Number(request.nonce) !== reservedNonce) {
            throw new Error(`❌ Invalid nonce. Expected reserved=${reservedNonce}, got=${request.nonce}`);
        }
        console.log(`✅ Nonce check passed for user=${request.from}: ${reservedNonce}`);
        const forwarder = new ethers_1.ethers.Contract(forwarderAddress, MinimalForwarder_json_1.default, this.ethersProvider.wallet);
        const isValid = await forwarder.verify({ ...request, signature });
        if (!isValid) {
            throw new Error('❌ Invalid signature');
        }
        console.log('✅ Signature verified.');
        const tx = await forwarder.execute({ ...request, signature }, {
            gasLimit: 500_000,
        });
        console.log(`✅ Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Transaction mined: ${receipt.hash}`);
        const txHash = receipt?.hash || receipt?.transactionHash || 'UNKNOWN';
        delete this.reservations[request.from][forwarderAddress];
        return {
            txHash,
            status: receipt.status ?? null,
        };
    }
};
exports.MetaService = MetaService;
exports.MetaService = MetaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ethers_provider_1.EthersProvider])
], MetaService);
//# sourceMappingURL=meta.service.js.map
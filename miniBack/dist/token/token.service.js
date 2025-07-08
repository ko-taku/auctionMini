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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const ethers_1 = require("ethers");
const claim_entity_1 = require("../claim/claim.entity");
const meta_service_1 = require("../meta/meta.service");
const ethers_provider_1 = require("./ethers.provider");
const AttendanceRewardMeta_json_1 = __importDefault(require("../abis/AttendanceRewardMeta.json"));
const MinimalForwarder_json_1 = __importDefault(require("../abis/MinimalForwarder.json"));
let TokenService = class TokenService {
    constructor(claimRepo, metaService, ethersProvider, configService) {
        this.claimRepo = claimRepo;
        this.metaService = metaService;
        this.ethersProvider = ethersProvider;
        this.configService = configService;
    }
    todayDate() {
        return new Date().toISOString().split('T')[0];
    }
    getForwarderContract() {
        const forwarderAddress = this.configService.get('FORWARDER_ADDRESS');
        console.log('✅ forwarderAddress:', forwarderAddress);
        console.log('✅ provider:', this.ethersProvider.provider);
        return new ethers_1.ethers.Contract(forwarderAddress, MinimalForwarder_json_1.default, this.ethersProvider.provider);
    }
    getAttendanceContract() {
        const contractAddress = this.configService.get('ATTENDANCE_ADDRESS');
        return new ethers_1.ethers.Contract(contractAddress, AttendanceRewardMeta_json_1.default.abi, this.ethersProvider.wallet);
    }
    async getClaimStatus(userAddress) {
        let claim = await this.claimRepo.findOneBy({ address: userAddress });
        if (!claim) {
            return {
                totalClaimEngage: 0,
                totalClaimAuction: 0,
            };
        }
        return {
            totalClaimEngage: claim.totalClaimEngage ?? 0,
            totalClaimAuction: claim.totalClaimAuction ?? 0,
        };
    }
    async reserve(type, userAddress) {
        const today = this.todayDate();
        let claim = await this.claimRepo.findOneBy({ address: userAddress });
        if (!claim) {
            claim = this.claimRepo.create({ address: userAddress });
        }
        if ((type === 'engage' && claim.lastClaimEngage === today) ||
            (type === 'auction' && claim.lastClaimAuction === today)) {
            throw new Error(`오늘 이미 ${type} 출석을 완료했습니다.`);
        }
        const forwarder = this.getForwarderContract();
        const nonceBn = await forwarder.nonces(userAddress);
        const nonce = Number(nonceBn);
        await this.metaService.reserveNonce(String(forwarder.target), userAddress);
        return { nonce };
    }
    async relay(type, userAddress, body) {
        const { forwarder, request, signature } = body;
        const today = this.todayDate();
        let claim = await this.claimRepo.findOneBy({ address: userAddress });
        if (!claim) {
            claim = this.claimRepo.create({ address: userAddress });
        }
        if ((type === 'engage' && claim.lastClaimEngage === today) ||
            (type === 'auction' && claim.lastClaimAuction === today)) {
            throw new Error(`오늘 이미 ${type} 출석을 완료했습니다.`);
        }
        const network = await this.ethersProvider.provider.getNetwork();
        const domain = {
            name: 'AuctionSystem',
            version: '1',
            chainId: network.chainId,
            verifyingContract: String(forwarder),
        };
        const types = {
            ForwardRequest: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'gas', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint48' },
                { name: 'data', type: 'bytes' },
            ],
        };
        const recovered = ethers_1.ethers.verifyTypedData(domain, types, request, signature);
        if (recovered.toLowerCase() !== userAddress.toLowerCase()) {
            throw new Error('Signature mismatch');
        }
        await this.metaService.relayMetaTransaction(String(forwarder), request, signature);
        if (type === 'engage') {
            claim.lastClaimEngage = today;
            claim.totalClaimEngage = (claim.totalClaimEngage || 0) + 1;
        }
        else {
            claim.lastClaimAuction = today;
            claim.totalClaimAuction = (claim.totalClaimAuction || 0) + 1;
        }
        await this.claimRepo.save(claim);
        return { success: true };
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(claim_entity_1.Claim)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        meta_service_1.MetaService,
        ethers_provider_1.EthersProvider,
        config_1.ConfigService])
], TokenService);
//# sourceMappingURL=token.service.js.map
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
exports.AuctionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ethers_1 = require("ethers");
const auction_entity_1 = require("./auction.entity");
const ethers_provider_1 = require("./ethers.provider");
const meta_service_1 = require("../meta/meta.service");
const AuctionManager_json_1 = __importDefault(require("../abis/AuctionManager.json"));
const MinimalForwarder_json_1 = __importDefault(require("../abis/MinimalForwarder.json"));
let AuctionService = class AuctionService {
    constructor(auctionRepo, ethersProvider, metaService) {
        this.auctionRepo = auctionRepo;
        this.ethersProvider = ethersProvider;
        this.metaService = metaService;
        this.nonceMap = {};
        this.wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, this.ethersProvider.provider);
        this.forwarder = new ethers_1.ethers.Contract(process.env.FORWARDER_ADDRESS, MinimalForwarder_json_1.default, this.wallet);
        this.auctionManager = new ethers_1.ethers.Contract(process.env.AUCTION_MANAGER_ADDRESS, AuctionManager_json_1.default.abi, this.wallet);
    }
    async reserveNonce(forwarder, userAddress) {
        const nonce = await this.metaService.reserveNonce(forwarder, userAddress);
        return { nonce };
    }
    async relay(forwarder, request, signature) {
        console.log("릴레이 request: ", request);
        const decoded = this.decodeCreateAuctionCalldata(request.data);
        console.log("디코디드 데이터: ", decoded);
        const { txHash } = await this.metaService.relayMetaTransaction(forwarder, request, signature);
        const now = new Date();
        const endAt = new Date(now.getTime() + decoded.duration * 1000);
        await this.auctionRepo.save({
            creator: request.from,
            nftContract: decoded.nftContract,
            tokenId: decoded.tokenId,
            startPrice: decoded.startPrice,
            minIncrement: decoded.minIncrement,
            duration: decoded.duration,
            txHash,
            endAt,
            escrowedAt: now,
        });
        return { txHash };
    }
    decodeCreateAuctionCalldata(data) {
        const iface = new ethers_1.ethers.Interface(AuctionManager_json_1.default.abi);
        const parsed = iface.parseTransaction({ data });
        if (!parsed || parsed.name !== 'createAuction') {
            throw new Error('Invalid calldata for createAuction');
        }
        const [nftContract, tokenId, startPrice, minIncrement, duration] = parsed.args;
        return {
            nftContract,
            tokenId: tokenId.toString(),
            startPrice: startPrice.toString(),
            minIncrement: minIncrement.toString(),
            duration: Number(duration),
        };
    }
    async getAuctionList() {
        const auctions = await this.auctionRepo.find();
        return auctions.map((auction) => ({
            id: auction.id,
            nftMetadata: {
                name: auction.nftName,
                image: auction.nftImage,
                description: auction.nftDescription,
            },
            creator: auction.creator,
            startPrice: auction.startPrice,
            highestBid: undefined,
            endAt: auction.endAt?.toISOString() ?? null,
            contractAddress: auction.nftContract,
            tokenId: auction.tokenId,
        }));
    }
};
exports.AuctionService = AuctionService;
exports.AuctionService = AuctionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auction_entity_1.Auction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ethers_provider_1.EthersProvider,
        meta_service_1.MetaService])
], AuctionService);
//# sourceMappingURL=auction.service.js.map
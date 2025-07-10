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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auction = void 0;
const typeorm_1 = require("typeorm");
let Auction = class Auction {
};
exports.Auction = Auction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id' }),
    __metadata("design:type", Number)
], Auction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'creator' }),
    __metadata("design:type", String)
], Auction.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nft_contract' }),
    __metadata("design:type", String)
], Auction.prototype, "nftContract", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_id' }),
    __metadata("design:type", String)
], Auction.prototype, "tokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_price' }),
    __metadata("design:type", String)
], Auction.prototype, "startPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_increment' }),
    __metadata("design:type", String)
], Auction.prototype, "minIncrement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration' }),
    __metadata("design:type", Number)
], Auction.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nft_image', nullable: true }),
    __metadata("design:type", String)
], Auction.prototype, "nftImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nft_name', nullable: true }),
    __metadata("design:type", String)
], Auction.prototype, "nftName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nft_description', nullable: true }),
    __metadata("design:type", String)
], Auction.prototype, "nftDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tx_hash', nullable: true }),
    __metadata("design:type", String)
], Auction.prototype, "txHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Auction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Auction.prototype, "endAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'escrowed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Auction.prototype, "escrowedAt", void 0);
exports.Auction = Auction = __decorate([
    (0, typeorm_1.Entity)({ name: 'auction_register' })
], Auction);
//# sourceMappingURL=auction.entity.js.map
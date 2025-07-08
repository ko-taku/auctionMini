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
exports.Claim = void 0;
const typeorm_1 = require("typeorm");
let Claim = class Claim {
};
exports.Claim = Claim;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Claim.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Claim.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_claim_engage', default: 0 }),
    __metadata("design:type", Number)
], Claim.prototype, "totalClaimEngage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_claim_auction', default: 0 }),
    __metadata("design:type", Number)
], Claim.prototype, "totalClaimAuction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_claim_engage', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Claim.prototype, "lastClaimEngage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_claim_auction', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Claim.prototype, "lastClaimAuction", void 0);
exports.Claim = Claim = __decorate([
    (0, typeorm_1.Entity)({ name: 'attendance_claim' })
], Claim);
//# sourceMappingURL=claim.entity.js.map
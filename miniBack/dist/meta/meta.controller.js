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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaController = void 0;
const common_1 = require("@nestjs/common");
const meta_service_1 = require("./meta.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let MetaController = class MetaController {
    constructor(metaService) {
        this.metaService = metaService;
    }
    async reserveNonce(req, forwarderAddress, userAddress) {
        if (req.user.address.toLowerCase() !== userAddress.toLowerCase()) {
            throw new common_1.UnauthorizedException('주소가 JWT와 일치하지 않습니다');
        }
        const nonce = await this.metaService.reserveNonce(forwarderAddress, userAddress);
        return { nonce };
    }
    async getOnChainNonce(forwarderAddress, userAddress) {
        const nonce = await this.metaService.getOnChainNonce(forwarderAddress, userAddress);
        return { nonce };
    }
    async relayMetaTransaction(req, body) {
        const { forwarder, request, signature } = body;
        if (req.user.address.toLowerCase() !== body.request.from.toLowerCase()) {
            throw new common_1.UnauthorizedException('주소 불일치');
        }
        return await this.metaService.relayMetaTransaction(forwarder, request, signature);
    }
};
exports.MetaController = MetaController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('nonce/reserve'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('forwarder')),
    __param(2, (0, common_1.Body)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MetaController.prototype, "reserveNonce", null);
__decorate([
    (0, common_1.Get)('nonce/current'),
    __param(0, (0, common_1.Query)('forwarder')),
    __param(1, (0, common_1.Query)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MetaController.prototype, "getOnChainNonce", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('relay'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MetaController.prototype, "relayMetaTransaction", null);
exports.MetaController = MetaController = __decorate([
    (0, common_1.Controller)('meta'),
    __metadata("design:paramtypes", [meta_service_1.MetaService])
], MetaController);
//# sourceMappingURL=meta.controller.js.map
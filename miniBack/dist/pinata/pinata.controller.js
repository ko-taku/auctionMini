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
exports.PinataController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const pinata_service_1 = require("./pinata.service");
let PinataController = class PinataController {
    constructor(pinataService) {
        this.pinataService = pinataService;
    }
    async uploadAll(file, name, description, attributesJson, userAddress) {
        console.log('프론트에서 받은 사용자 지갑 주소:', userAddress);
        const attributes = JSON.parse(attributesJson);
        const fileUrl = await this.pinataService.uploadFileToIPFS(file);
        const metadataUri = await this.pinataService.uploadMetadataToIPFS(fileUrl, {
            name,
            description,
            attributes,
        });
        return {
            image: fileUrl,
            tokenURI: metadataUri,
            userAddress,
        };
    }
    async relayMetaTransaction(request, Signature) {
        return await this.pinataService.relayMetaTransaction(request, Signature);
    }
};
exports.PinataController = PinataController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Body)('description')),
    __param(3, (0, common_1.Body)('attributes')),
    __param(4, (0, common_1.Body)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PinataController.prototype, "uploadAll", null);
__decorate([
    (0, common_1.Post)('relay'),
    __param(0, (0, common_1.Body)('request')),
    __param(1, (0, common_1.Body)('signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PinataController.prototype, "relayMetaTransaction", null);
exports.PinataController = PinataController = __decorate([
    (0, common_1.Controller)('pinata'),
    __metadata("design:paramtypes", [pinata_service_1.PinataService])
], PinataController);
//# sourceMappingURL=pinata.controller.js.map
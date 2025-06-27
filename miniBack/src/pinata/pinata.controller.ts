import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PinataService } from './pinata.service';
import { request } from 'http';
import { Signature } from 'ethers';

@Controller('pinata')
export class PinataController {
    constructor(private readonly pinataService: PinataService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAll(
        @UploadedFile() file: Express.Multer.File,
        @Body('name') name: string,
        @Body('description') description: string,
        @Body('attributes') attributesJson: string,
        @Body('userAddress') userAddress: string,
    ) {

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

    @Post('relay')
    async relayMetaTransaction(
        @Body('request') request: any,
        @Body('signature') Signature: string,
    ) {
        return await this.pinataService.relayMetaTransaction(request, Signature);
    }
}

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import ForwarderAbi from '../abis/MinimalForwarder.json';
import { EthersProvider } from './ethers.provider';
import { ethers } from 'ethers';
const FormData = require('form-data');

@Injectable()
export class PinataService {
    constructor(private readonly configService: ConfigService,
        private readonly ethersProvider: EthersProvider,
    ) { }


    async uploadFileToIPFS(file: Express.Multer.File): Promise<string> {
        const jwt = this.configService.get<string>('PINATA_JWT');
        const url = 'https://uploads.pinata.cloud/v3/files';

        const fileName = `image-${uuidv4()}`;

        const formData = new FormData();
        formData.append('file', Readable.from(file.buffer), {
            filename: fileName,
        });
        formData.append('name', fileName);
        formData.append('network', 'public');

        const response = await axios.post(url, formData, {
            headers: {
                Authorization: `Bearer ${jwt}`,
                ...formData.getHeaders(),
            },
        });
        const cid = response.data.data.cid;
        const fileUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        return fileUrl;
    }

    async uploadMetadataToIPFS(fileUrl: string, metadataInput: {
        name: string;
        description: string;
        attributes: { trait_type: string; value: any }[];
    }): Promise<string> {
        const jwt = this.configService.get<string>('PINATA_JWT');

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

        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            body,
            {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json; charset=utf-8',
                },
            },
        );

        const metadataUri = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        return metadataUri;
    }

    async relayMetaTransaction(request: any, signature: string): Promise<any> {
        const forwarderAddress = this.configService.get<string>('FORWARDER_ADDRESS');
        const forwarder = new ethers.Contract(
            forwarderAddress,
            ForwarderAbi,
            this.ethersProvider.wallet,
        );

        console.log('ForwardRequest: ', request);
        console.log('서명: ', signature);


        const requestWithSignature = {
            ...request,
            signature
        };

        const isValid = await forwarder.verify(requestWithSignature);
        if (!isValid) {
            throw new Error('잘못된 서명입니다');
        }
        console.log('서명 겸증 성공');

        const tx = await forwarder.execute(requestWithSignature, {
            gasLimit: 500_000,
        });
        console.log('execute 트랜잭션 전송: ', tx.hash);

        const receipt = await tx.wait();
        console.log('트랜잭션 채굴 완료: ', receipt.transactionHash);

        return {
            txHash: receipt.transactionHash,
            status: receipt.status,
        };
    }
}

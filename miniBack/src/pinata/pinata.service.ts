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

        // relayMetaTransaction 함수 안에서
        console.log('✅ Received ForwardRequest:', request);
        console.log('✅ Received Signature:', signature);

        // 로그 찍기
        console.log('✅ SERVER Relayer Wallet Address:', this.ethersProvider.wallet.address);
        console.log('✅ SERVER Provider:', this.ethersProvider.provider);

        const network = await this.ethersProvider.provider.getNetwork();
        console.log('✅ SERVER Network:', network);
        console.log('✅ SERVER ChainId:', network.chainId.toString());

        try {
            const network = await this.ethersProvider.provider.getNetwork();
            console.log('✅ SERVER Network:', network);
        } catch (err) {
            console.error('❌ Error getting network:', err);
        }

        console.log('✅ Forwarder Address (서버):', forwarderAddress);
        console.log('✅ Relayer Wallet Address (서버):', this.ethersProvider.wallet.address);


        // 서버에서도 on-chain nonce 확인
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
        //ethersV6은 hash, V5는 transactionHash, 둘 다 없으면 UNKNOWN
        console.log('✅ 트랜잭션 채굴 완료: ', txHash);

        return {
            txHash,
            status: receipt?.status ?? null,
            //status가 undefined일 수 있는 경우 대비, 반드시 null 또는 0/1 형태로 리턴하도록 안전 처리
        };
    }
}

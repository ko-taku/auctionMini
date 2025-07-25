import { IsString, IsNotEmpty, IsDefined, IsObject } from 'class-validator';

export class RelayRequestDto {
    @IsString()
    @IsNotEmpty()
    forwarder: string;

    // request는 구조체라 타입 제한이 어렵지만 기본 검증 가능
    //request 필드에 아무 데코레이터가 없으면 whitelist가 필터링 해버린다
    @IsDefined()
    @IsObject()
    request: any;

    @IsString()
    @IsNotEmpty()
    signature: string;
}

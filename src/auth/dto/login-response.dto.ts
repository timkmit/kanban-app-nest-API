import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token', example: 'your.jwt.token.here' })
  access_token: string;
}
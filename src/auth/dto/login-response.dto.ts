import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from './user-profile.dto';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token', example: 'your.jwt.token.here' })
  access_token: string;

  @ApiProperty({ description: 'User details', type: UserProfileDto })
  user: UserProfileDto;
}
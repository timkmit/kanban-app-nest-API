import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Username of the user', example: 'testuser' })
  username: string;

  @ApiProperty({ description: 'Password of the user', example: 'password123' })
  password: string;
}
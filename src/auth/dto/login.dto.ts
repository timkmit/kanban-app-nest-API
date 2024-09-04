import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  username?: string;

  @ApiProperty({ description: 'Email of the user', example: 'testuser@mail.ru' })
  email?: string;

  @ApiProperty({ description: 'Password of the user', example: 'password123' })
  password: string;
}
import { ApiProperty } from "@nestjs/swagger";

export class UserProfileDto {
    @ApiProperty({ description: 'ID of the user', example: '64c5f6e6c5c5f6e6c5c5f6e6' })
    id: string;
  
    @ApiProperty({ description: 'Username of the user', example: 'testuser' })
    username: string;
  
    @ApiProperty({ description: 'Email of the user', example: 'testuser@example.com' })
    email: string;
  }
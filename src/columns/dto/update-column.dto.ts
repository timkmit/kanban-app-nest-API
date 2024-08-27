import { ApiProperty } from '@nestjs/swagger';

export class UpdateColumnDto {
  @ApiProperty({
    description: 'Updated title of the column',
    example: 'In Progress',
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: 'Updated description of the column',
    example: 'Tasks that are currently being worked on',
    required: false,
  })
  description?: string;
}
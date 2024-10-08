import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({ description: 'ID of the board the column belongs to', example: 'boardId123' })
  boardId: string;

  @ApiProperty({ description: 'Title of the column', example: 'To Do' })
  title: string;

  @ApiProperty({ description: 'Description of the column', example: 'Tasks to be done' })
  description?: string;
}
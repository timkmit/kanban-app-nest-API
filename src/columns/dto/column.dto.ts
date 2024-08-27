import { ApiProperty } from '@nestjs/swagger';

export class ColumnDto {
  @ApiProperty({ description: 'ID of the column', example: 'columnId123' })
  id: string;

  @ApiProperty({ description: 'Title of the column', example: 'To Do' })
  title: string;

  @ApiProperty({ description: 'Description of the column', example: 'Tasks to be done' })
  description?: string;

  @ApiProperty({ description: 'ID of the board the column belongs to', example: 'boardId123' })
  boardId: string;
}
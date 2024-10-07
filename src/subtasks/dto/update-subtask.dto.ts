import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubtaskDto {
  @ApiProperty({ example: 'Updated Subtask Title', description: 'The title of the subtask' })
  title?: string;

  @ApiProperty({ example: 'Updated description for the subtask', description: 'Description of the subtask' })
  description?: string;

  @ApiProperty({ example: true, description: 'Is the subtask done' })
  isDone?: boolean;
}
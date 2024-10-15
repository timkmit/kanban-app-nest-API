import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubtaskDto {
  @ApiProperty({ example: 'Updated Subtask Title', description: 'The title of the subtask' })
  title?: string;

  description?: string;

  isDone?: boolean;
}
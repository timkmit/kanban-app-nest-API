import { ApiProperty } from '@nestjs/swagger';

export class SubtaskDto {
  @ApiProperty({ description: 'ID of the subtask', example: 'subtaskId123' })
  id: string;

  @ApiProperty({ description: 'Title of the subtask', example: 'Design homepage' })
  title: string;

  @ApiProperty({ description: 'Description of the subtask', example: 'Create the initial design for the homepage' })
  description?: string;

  @ApiProperty({ description: 'Status of the subtask', example: 'Pending' })
  status: string;

  @ApiProperty({ description: 'ID of the task the subtask belongs to', example: 'taskId123' })
  taskId: string;
}
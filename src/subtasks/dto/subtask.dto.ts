import { ApiProperty } from '@nestjs/swagger';

export class SubtaskDto {
  @ApiProperty({ description: 'ID of the subtask', example: 'subtaskId123' })
  id: string;

  @ApiProperty({ description: 'Title of the subtask', example: 'Design homepage' })
  title: string;

  description?: string;

  @ApiProperty({ description: 'Статус подзадачи', example: false })
  isDone: boolean;

  @ApiProperty({ description: 'ID of the task the subtask belongs to', example: 'taskId123' })
  taskId: string;
}